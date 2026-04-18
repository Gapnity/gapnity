"""SQLAlchemy engine + session factory.

Falls back gracefully to in-memory fixtures when DATABASE_URL is not set.
Provide DATABASE_URL in .env to persist to Postgres.
"""
from __future__ import annotations

import os
from typing import Iterator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "")

engine = create_engine(DATABASE_URL, future=True) if DATABASE_URL else None
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False) if engine else None


def get_db() -> Iterator[Session | None]:
    if not SessionLocal:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables. Safe to call multiple times (no-op if tables exist)."""
    if not engine:
        return
    from app.db.models import Base  # noqa: F401 — import triggers registration
    Base.metadata.create_all(bind=engine)


def db_is_empty(db: Session) -> bool:
    """Return True if the teams table has no rows."""
    try:
        result = db.execute(text("SELECT COUNT(*) FROM teams")).scalar()
        return result == 0
    except Exception:
        return True
