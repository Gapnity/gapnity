"""Database layer — SQLAlchemy with psycopg2 for Neon/Postgres."""
from __future__ import annotations

import os
from typing import Iterator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "")

engine = create_engine(DATABASE_URL, pool_pre_ping=True) if DATABASE_URL else None
SessionLocal = sessionmaker(bind=engine) if engine else None


def get_db() -> Iterator[Session | None]:
    if not SessionLocal:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def execute_sql(query: str, params: dict = None) -> list:
    if not engine:
        return []
    try:
        with engine.connect() as conn:
            result = conn.execute(text(query), params or {})
            cols = list(result.keys())
            return [dict(zip(cols, row)) for row in result.fetchall()]
    except Exception as e:
        print(f"[DB] SQL error: {e}")
        return []


def execute_sql_write(query: str, params: dict = None) -> bool:
    if not engine:
        return False
    try:
        with engine.connect() as conn:
            conn.execute(text(query), params or {})
            conn.commit()
        return True
    except Exception as e:
        print(f"[DB] Write error: {e}")
        return False


def init_db() -> None:
    if not engine:
        print("⚠️  No DATABASE_URL — running with in-memory fixtures.")
        return
    tables = [
        "CREATE TABLE IF NOT EXISTS teams (id VARCHAR PRIMARY KEY, name VARCHAR NOT NULL, created_at TIMESTAMP DEFAULT NOW())",
        "CREATE TABLE IF NOT EXISTS users (id VARCHAR PRIMARY KEY, team_id VARCHAR REFERENCES teams(id), name VARCHAR NOT NULL, email VARCHAR UNIQUE, role VARCHAR)",
        "CREATE TABLE IF NOT EXISTS sprints (id VARCHAR PRIMARY KEY, team_id VARCHAR REFERENCES teams(id), name VARCHAR NOT NULL, start_date VARCHAR, end_date VARCHAR, state VARCHAR DEFAULT 'active')",
        "CREATE TABLE IF NOT EXISTS meetings (id VARCHAR PRIMARY KEY, sprint_id VARCHAR REFERENCES sprints(id), meeting_type VARCHAR NOT NULL, title VARCHAR, transcript_text TEXT, created_at TIMESTAMP DEFAULT NOW())",
        "CREATE TABLE IF NOT EXISTS themes (id VARCHAR PRIMARY KEY, team_id VARCHAR REFERENCES teams(id), canonical_name VARCHAR NOT NULL, description TEXT)",
        "CREATE TABLE IF NOT EXISTS issues (id VARCHAR PRIMARY KEY, sprint_id VARCHAR REFERENCES sprints(id), theme_id VARCHAR REFERENCES themes(id), description TEXT, severity VARCHAR DEFAULT 'medium', confidence_score FLOAT DEFAULT 0.75)",
        "CREATE TABLE IF NOT EXISTS actions (id VARCHAR PRIMARY KEY, sprint_id VARCHAR REFERENCES sprints(id), issue_id VARCHAR REFERENCES issues(id), description TEXT, owner_name VARCHAR, due_date VARCHAR, status VARCHAR DEFAULT 'new', effectiveness_score INTEGER)",
        "CREATE TABLE IF NOT EXISTS evidence_links (id VARCHAR PRIMARY KEY, sprint_id VARCHAR REFERENCES sprints(id), source_type VARCHAR, source_ref VARCHAR, description TEXT)",
        "CREATE TABLE IF NOT EXISTS outcomes (id VARCHAR PRIMARY KEY, action_id VARCHAR REFERENCES actions(id), next_sprint_id VARCHAR REFERENCES sprints(id), outcome_label VARCHAR, notes TEXT)",
    ]
    for stmt in tables:
        execute_sql_write(stmt)
    print("✅ Database tables ready.")


def db_is_empty() -> bool:
    try:
        rows = execute_sql("SELECT COUNT(*) as count FROM teams")
        return int(rows[0]["count"]) == 0 if rows else True
    except Exception:
        return True