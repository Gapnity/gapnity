"""Sprints router."""
from __future__ import annotations

from fastapi import APIRouter
from app.db.base import execute_sql, DATABASE_URL
from app.schemas.models import Sprint

router = APIRouter()

FIXTURE_SPRINTS = [
    Sprint(id="s24", team_id="platform", name="Sprint 24", start_date="2026-04-06", end_date="2026-04-17", state="active"),
    Sprint(id="s23", team_id="platform", name="Sprint 23", start_date="2026-02-09", end_date="2026-03-06", state="closed"),
    Sprint(id="s22", team_id="platform", name="Sprint 22", start_date="2026-01-26", end_date="2026-02-06", state="closed"),
    Sprint(id="s21", team_id="platform", name="Sprint 21", start_date="2026-01-12", end_date="2026-01-23", state="closed"),
    Sprint(id="s20", team_id="platform", name="Sprint 20", start_date="2025-12-22", end_date="2026-01-09", state="closed"),
    Sprint(id="s19", team_id="platform", name="Sprint 19", start_date="2025-12-08", end_date="2025-12-19", state="closed"),
]


@router.get("", response_model=list[Sprint])
def list_sprints() -> list[Sprint]:
    if not DATABASE_URL:
        return FIXTURE_SPRINTS

    rows = execute_sql("SELECT id, team_id, name, start_date, end_date, state FROM sprints ORDER BY start_date DESC")
    if not rows:
        return FIXTURE_SPRINTS

    return [Sprint(**r) for r in rows]


@router.get("/{sprint_id}")
def get_sprint(sprint_id: str) -> dict:
    if not DATABASE_URL:
        s = next((s for s in FIXTURE_SPRINTS if s.id == sprint_id), FIXTURE_SPRINTS[0])
        return {"sprint": s, "issues": [], "actions": [], "comparison": None}

    sprints = execute_sql("SELECT id, team_id, name, start_date, end_date, state FROM sprints WHERE id = :id", {"id": sprint_id})
    if not sprints:
        return {"sprint": None, "issues": [], "actions": [], "comparison": None}

    issues = execute_sql("SELECT * FROM issues WHERE sprint_id = :id", {"id": sprint_id})
    actions = execute_sql("SELECT * FROM actions WHERE sprint_id = :id", {"id": sprint_id})

    return {
        "sprint": sprints[0],
        "issues": issues,
        "actions": actions,
        "comparison": None,
    }
