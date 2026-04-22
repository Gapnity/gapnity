"""Actions router."""
from __future__ import annotations

from fastapi import APIRouter
from app.db.base import execute_sql, DATABASE_URL
from app.schemas.models import ActionItem

router = APIRouter()

FIXTURE_ACTIONS = [
    ActionItem(id="a1", sprint_id="s24", issue_id="i1", description="Stabilize staging: containerize DB seeds + add health-check retry", owner_name="Priya", due_date="2026-04-22", status="in_progress"),
    ActionItem(id="a2", sprint_id="s24", issue_id="i2", description="PO pre-reads stories 48h before sprint start",                      owner_name="Arjun", due_date="2026-04-20", status="new"),
    ActionItem(id="a3", sprint_id="s24", issue_id="i3", description="Isolate payment-gateway tests with deterministic fixtures",          owner_name="Mei",   due_date="2026-04-02", status="completed", effectiveness_score=78),
    ActionItem(id="a4", sprint_id="s23", description="Reduce WIP limit to 4 per engineer",                                               owner_name="Ishan", due_date="2026-03-18", status="effective",  effectiveness_score=84),
    ActionItem(id="a5", sprint_id="s23", description="Split planning into scoping + estimation sessions",                                 owner_name="Lena",  due_date="2026-03-19", status="not_effective", effectiveness_score=31),
]


@router.get("", response_model=list[ActionItem])
def list_actions() -> list[ActionItem]:
    if not DATABASE_URL:
        return FIXTURE_ACTIONS

    rows = execute_sql("""
        SELECT id, sprint_id, issue_id, description, owner_name,
               due_date, status, effectiveness_score
        FROM actions
        ORDER BY
            CASE status
                WHEN 'new' THEN 1
                WHEN 'in_progress' THEN 2
                WHEN 'completed' THEN 3
                WHEN 'effective' THEN 4
                WHEN 'not_effective' THEN 5
                ELSE 6
            END,
            due_date ASC NULLS LAST
    """)

    if not rows:
        return FIXTURE_ACTIONS

    return [
        ActionItem(
            id=r["id"],
            sprint_id=r["sprint_id"],
            issue_id=r.get("issue_id"),
            description=r["description"],
            owner_name=r.get("owner_name"),
            due_date=r.get("due_date"),
            status=r["status"],
            effectiveness_score=r.get("effectiveness_score"),
        )
        for r in rows
    ]
