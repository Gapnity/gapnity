"""OAuth routes — Google and GitHub sign-in."""
from __future__ import annotations

import os
import uuid
import secrets
from datetime import datetime, timedelta

import httpx
from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.db.models import User, Workspace
from app.routers.auth import _create_token

router = APIRouter()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL  = os.getenv("BACKEND_URL",  "http://localhost:8000")

GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GITHUB_CLIENT_ID     = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")

GOOGLE_REDIRECT_URI = f"{BACKEND_URL}/api/auth/google/callback"
GITHUB_REDIRECT_URI = f"{BACKEND_URL}/api/auth/github/callback"


def _success_redirect(token: str, workspace_id: str) -> RedirectResponse:
    url = f"{FRONTEND_URL}/auth/callback?token={token}&workspace_id={workspace_id}"
    return RedirectResponse(url=url)


def _error_redirect(msg: str) -> RedirectResponse:
    url = f"{FRONTEND_URL}/auth/callback?error={msg}"
    return RedirectResponse(url=url)


def _get_or_create_user(db: Session, email: str, name: str, provider: str) -> tuple[User, str]:
    """Find existing user or create a new OAuth user. Returns (user, workspace_id)."""
    user = db.query(User).filter(User.email == email.lower()).first()

    if not user:
        user = User(
            id=str(uuid.uuid4()),
            name=name,
            email=email.lower(),
            password_hash=None,  # OAuth users have no password
            plan="starter",
            account_type="personal",
            company=None,
            role="admin",
            email_verified="true",  # OAuth emails are pre-verified
            verification_token=None,
        )
        db.add(user)

        ws_name = f"{name}'s Workspace"
        workspace = Workspace(
            id=str(uuid.uuid4()),
            name=ws_name,
            type="project",
            description=f"Workspace for {name}",
            color="#7c3aed",
        )
        db.add(workspace)
        db.commit()
        db.refresh(user)
        db.refresh(workspace)
        workspace_id = workspace.id
    else:
        # Existing user — find their workspace
        ws = db.query(Workspace).filter(Workspace.id != "platform").order_by(Workspace.created_at.desc()).first()
        workspace_id = ws.id if ws else "platform"
        # Mark email verified if coming via OAuth
        if str(user.email_verified).lower() not in ("true", "1"):
            user.email_verified = "true"
            db.commit()

    return user, workspace_id


# ── Google ────────────────────────────────────────────────────────────────────

@router.get("/google")
def google_login():
    if not GOOGLE_CLIENT_ID:
        return _error_redirect("Google+OAuth+not+configured")
    params = (
        f"client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=openid+email+profile"
        f"&access_type=offline"
    )
    return RedirectResponse(url=f"https://accounts.google.com/o/oauth2/v2/auth?{params}")


@router.get("/google/callback")
def google_callback(code: str = "", error: str = "", db: Session = Depends(get_db)):
    if error or not code:
        return _error_redirect("Google+sign-in+cancelled")

    try:
        with httpx.Client() as client:
            # Exchange code for tokens
            token_res = client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
            )
            token_data = token_res.json()
            access_token = token_data.get("access_token")

            # Get user info
            user_res = client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            info = user_res.json()
            email = info.get("email")
            name  = info.get("name") or email.split("@")[0]
    except Exception as e:
        print(f"Google OAuth error: {e}")
        return _error_redirect("Google+sign-in+failed")

    if not email:
        return _error_redirect("Could+not+retrieve+email+from+Google")

    user, workspace_id = _get_or_create_user(db, email, name, "google")
    jwt = _create_token(user.id, user.email)
    return _success_redirect(jwt, workspace_id)


# ── GitHub ────────────────────────────────────────────────────────────────────

@router.get("/github")
def github_login():
    if not GITHUB_CLIENT_ID:
        return _error_redirect("GitHub+OAuth+not+configured")
    state = secrets.token_urlsafe(16)
    params = (
        f"client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={GITHUB_REDIRECT_URI}"
        f"&scope=user:email"
        f"&state={state}"
    )
    return RedirectResponse(url=f"https://github.com/login/oauth/authorize?{params}")


@router.get("/github/callback")
def github_callback(code: str = "", error: str = "", db: Session = Depends(get_db)):
    if error or not code:
        return _error_redirect("GitHub+sign-in+cancelled")

    try:
        with httpx.Client() as client:
            # Exchange code for access token
            token_res = client.post(
                "https://github.com/login/oauth/access_token",
                json={
                    "client_id": GITHUB_CLIENT_ID,
                    "client_secret": GITHUB_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": GITHUB_REDIRECT_URI,
                },
                headers={"Accept": "application/json"},
            )
            token_data = token_res.json()
            access_token = token_data.get("access_token")

            # Get user profile
            user_res = client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
            )
            profile = user_res.json()
            name = profile.get("name") or profile.get("login", "GitHub User")

            # Get primary email (GitHub may not expose it in profile)
            email = profile.get("email")
            if not email:
                email_res = client.get(
                    "https://api.github.com/user/emails",
                    headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
                )
                emails = email_res.json()
                primary = next((e for e in emails if e.get("primary") and e.get("verified")), None)
                email = primary["email"] if primary else None
    except Exception as e:
        print(f"GitHub OAuth error: {e}")
        return _error_redirect("GitHub+sign-in+failed")

    if not email:
        return _error_redirect("Could+not+retrieve+email+from+GitHub")

    user, workspace_id = _get_or_create_user(db, email, name, "github")
    jwt = _create_token(user.id, user.email)
    return _success_redirect(jwt, workspace_id)
