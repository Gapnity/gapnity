"""Themes router."""
from __future__ import annotations

from fastapi import APIRouter
from app.db.base import execute_sql, DATABASE_URL
from app.schemas.models import Theme

router = APIRouter()

FIXTURE_THEMES = [
    Theme(id="t_env",   canonical_name="Environment instability",    description="Staging/CI environment failures blocking QA or deployments", occurrences=5),
    Theme(id="t_ac",    canonical_name="Unclear acceptance criteria", description="AC ambiguity causing mid-sprint clarification or rewrites",    occurrences=4),
    Theme(id="t_flaky", canonical_name="Flaky automation",           description="Non-deterministic test failures costing engineer time",        occurrences=4),
    Theme(id="t_dep",   canonical_name="External dependency delays",  description="Blocked on third-party APIs or team dependencies",            occurrences=3),
    Theme(id="t_scope", canonical_name="Mid-sprint scope creep",      description="Stories expanded or added after sprint start",                occurrences=3),
    Theme(id="t_carry", canonical_name="Story carryover",             description="Stories not completed within the sprint",                     occurrences=3),
]


@router.get("/recurring", response_model=list[Theme])
def recurring_themes() -> list[Theme]:
    if not DATABASE_URL:
        return FIXTURE_THEMES

    rows = execute_sql("""
        SELECT t.id, t.canonical_name, t.description,
               COUNT(DISTINCT i.sprint_id) as occurrences
        FROM themes t
        LEFT JOIN issues i ON i.theme_id = t.id
        GROUP BY t.id, t.canonical_name, t.description
        ORDER BY occurrences DESC
    """)

    if not rows:
        return FIXTURE_THEMES

    return [
        Theme(
            id=r["id"],
            canonical_name=r["canonical_name"],
            description=r["description"],
            occurrences=int(r["occurrences"] or 0),
        )
        for r in rows
    ]
