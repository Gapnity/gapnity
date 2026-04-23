"""Authentication router — register, login, verify email, profile update."""
from __future__ import annotations

import hashlib
import hmac
import os
import secrets
import smtplib
import uuid
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.db.base import get_db
from app.db.models import User, Workspace

router = APIRouter()

# ── Config ────────────────────────────────────────────────────────────────────

SECRET_KEY = os.getenv("JWT_SECRET", "gapnity-dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

bearer = HTTPBearer(auto_error=False)


# ── Password helpers (PBKDF2-SHA256, no external deps) ───────────────────────

def _hash(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 260_000)
    return f"{salt}${key.hex()}"

def _verify(plain: str, stored: str) -> bool:
    try:
        salt, key_hex = stored.split("$", 1)
        key = hashlib.pbkdf2_hmac("sha256", plain.encode(), salt.encode(), 260_000)
        return hmac.compare_digest(key.hex(), key_hex)
    except Exception:
        return False


# ── JWT helpers ───────────────────────────────────────────────────────────────

def _create_token(user_id: str, email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": user_id, "email": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def _decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


# ── Email sending ─────────────────────────────────────────────────────────────

def _send_verification_email(to_email: str, name: str, token: str) -> bool:
    """Send verification email. Returns True on success, False on failure."""
    verify_url = f"{FRONTEND_URL}/verify?token={token}"

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    from_email = os.getenv("SMTP_FROM", smtp_user or "noreply@gapnity.com")

    html = f"""
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#0a0a0f;color:#e2e8f0;border-radius:16px;">
      <img src="{FRONTEND_URL}/gapnity-logo.png" width="40" style="border-radius:8px;margin-bottom:20px;" />
      <h2 style="color:#fff;margin:0 0 8px;">Verify your email, {name.split()[0]}</h2>
      <p style="color:#94a3b8;margin:0 0 24px;">Click the button below to verify your email address and access your GAPNITY workspace.</p>
      <a href="{verify_url}"
         style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px;">
        Verify email address
      </a>
      <p style="color:#475569;font-size:12px;margin-top:24px;">
        Or copy this link: <a href="{verify_url}" style="color:#7c3aed;">{verify_url}</a>
      </p>
      <p style="color:#475569;font-size:12px;">This link expires in 24 hours. If you didn't create a GAPNITY account, ignore this email.</p>
    </div>
    """

    if smtp_host and smtp_user and smtp_pass:
        print(f"📤  Attempting SMTP: {smtp_user} → {smtp_host}:{smtp_port}")
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Verify your GAPNITY email"
            msg["From"] = f"GAPNITY <{from_email}>"
            msg["To"] = to_email
            msg.attach(MIMEText(html, "html"))
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.set_debuglevel(0)
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_email, to_email, msg.as_string())
            print(f"✉️  Verification email sent to {to_email}")
            return True
        except Exception as e:
            import traceback
            print(f"⚠️  Email send failed: {e}")
            print(traceback.format_exc())
            print(f"🔗  Verify URL (dev fallback): {verify_url}")
            return False
    else:
        # Dev mode — print to console
        print(f"\n{'='*60}")
        print(f"📧  VERIFICATION EMAIL (no SMTP configured)")
        print(f"To: {to_email}")
        print(f"Link: {verify_url}")
        print(f"{'='*60}\n")
        return True  # Treat console-print as success in dev mode


# ── Schemas ───────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    company: Optional[str] = None
    plan: str = "starter"
    account_type: str = "personal"   # "personal" | "company"

class LoginRequest(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    plan: str
    account_type: str
    company: Optional[str] = None
    role: str
    email_verified: bool

    class Config:
        from_attributes = True

    @classmethod
    def model_validate(cls, obj, **kwargs):
        data = {
            "id": obj.id,
            "name": obj.name,
            "email": obj.email,
            "plan": obj.plan or "starter",
            "account_type": obj.account_type or "personal",
            "company": obj.company,
            "role": obj.role or "member",
            "email_verified": str(obj.email_verified).lower() in ("true", "1", "t"),
        }
        return cls(**data)

class AuthResponse(BaseModel):
    token: str
    user: UserOut
    workspace_id: str

class UpdateRequest(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    account_type: Optional[str] = None


# ── Shared auth helper ────────────────────────────────────────────────────────

def _get_current_user(credentials: HTTPAuthorizationCredentials, db: Session) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = _decode_token(credentials.credentials)
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/register", response_model=AuthResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    existing = db.query(User).filter(User.email == body.email.lower()).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    verification_token = secrets.token_urlsafe(32)

    user = User(
        id=str(uuid.uuid4()),
        name=body.name,
        email=body.email.lower(),
        password_hash=_hash(body.password),
        plan=body.plan,
        account_type=body.account_type,
        company=body.company,
        role="admin",
        email_verified="false",
        verification_token=verification_token,
    )
    db.add(user)

    ws_name = body.company if body.account_type == "company" and body.company else f"{body.name}'s Workspace"
    workspace = Workspace(
        id=str(uuid.uuid4()),
        name=ws_name,
        type="team" if body.account_type == "company" else "project",
        description=f"Workspace for {body.name}",
        color="#7c3aed",
    )
    db.add(workspace)
    db.commit()
    db.refresh(user)
    db.refresh(workspace)

    sent = _send_verification_email(user.email, user.name, verification_token)
    if not sent:
        print(f"⚠️  Could not send verification email on register — token: {verification_token}")

    token = _create_token(user.id, user.email)
    return AuthResponse(token=token, user=UserOut.model_validate(user), workspace_id=workspace.id)


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    user = db.query(User).filter(User.email == body.email.lower()).first()
    if not user or not user.password_hash or not _verify(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    ws = db.query(Workspace).filter(Workspace.id != "platform").order_by(Workspace.created_at.desc()).first()
    workspace_id = ws.id if ws else "platform"

    token = _create_token(user.id, user.email)
    return AuthResponse(token=token, user=UserOut.model_validate(user), workspace_id=workspace_id)


@router.get("/verify")
def verify_email(token: str, db: Session = Depends(get_db)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link.")
    user.email_verified = "true"
    user.verification_token = None
    db.commit()
    return {"verified": True, "email": user.email}


@router.post("/resend-verification")
def resend_verification(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
):
    user = _get_current_user(credentials, db)
    if str(user.email_verified).lower() in ("true", "1"):
        return {"message": "Email already verified"}
    token = secrets.token_urlsafe(32)
    user.verification_token = token
    db.commit()
    sent = _send_verification_email(user.email, user.name, token)
    verify_url = f"{FRONTEND_URL}/verify?token={token}"
    if not sent:
        raise HTTPException(
            status_code=503,
            detail=f"Email delivery failed. Use this link to verify: {verify_url}"
        )
    return {"message": "Verification email sent"}


@router.get("/me", response_model=UserOut)
def me(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
):
    return UserOut.model_validate(_get_current_user(credentials, db))


@router.patch("/update", response_model=UserOut)
def update_profile(
    body: UpdateRequest,
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
):
    user = _get_current_user(credentials, db)
    if body.name is not None:
        user.name = body.name
    if body.company is not None:
        user.company = body.company
    if body.account_type is not None:
        user.account_type = body.account_type
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)
