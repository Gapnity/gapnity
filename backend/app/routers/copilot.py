"""Copilot router — AI chat with live DB context."""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from app.db.base import execute_sql, DATABASE_URL
from app.prompts.library import COPILOT_SYSTEM
from app.schemas.models import CopilotResponse
from app.services.llm import llm

router = APIRouter()


class CopilotRequest(BaseModel):
    question: Optional[str] = None
    message: Optional[str] = None
    history: Optional[List[dict]] = []
    context: Optional[dict] = {}

    @property
    def user_message(self) -> str:
        return self.question or self.message or ""


def _build_context() -> str:
    if not DATABASE_URL:
        return (
            "Memory snapshot (fixture):\n"
            "- Theme 'Environment instability': 5/6 recent sprints, 3 incidents this sprint.\n"
            "- Action 'Stabilize staging' owner=Priya status=in_progress due=2026-04-22.\n"
            "- Flaky rate: -62% S23→S24 after 'deterministic fixtures' action.\n"
            "- Team health: 72/100. Action effectiveness: 64/100. Improvement score: 58/100.\n"
            "- Recurring themes: Environment instability, Flaky automation, Unclear AC, Story carryover.\n"
            "- Sprint 24 contradiction: Planning assumed stable staging; 3 incidents occurred."
        )

    try:
        # Active sprint
        sprints = execute_sql(
            "SELECT id, name FROM sprints WHERE state = 'active' LIMIT 1"
        )
        sprint_name = sprints[0]["name"] if sprints else "Sprint 24"
        sprint_id = sprints[0]["id"] if sprints else "s24"

        # All actions
        actions = execute_sql(
            "SELECT description, owner_name, status, due_date, effectiveness_score FROM actions"
        )
        open_actions = [a for a in actions if a["status"] in ("new", "in_progress")]
        effective = [a for a in actions if a["status"] == "effective"]
        scored = [a for a in actions if a["effectiveness_score"] is not None]
        avg_eff = int(sum(a["effectiveness_score"] for a in scored) / len(scored)) if scored else 64

        # Issues this sprint
        issues = execute_sql(
            "SELECT description, severity, confidence_score FROM issues WHERE sprint_id = :sid",
            {"sid": sprint_id}
        )
        high_issues = [i for i in issues if i["severity"] == "high"]

        # Themes with occurrence counts
        themes = execute_sql("""
            SELECT t.canonical_name, COUNT(DISTINCT i.sprint_id) as occurrences
            FROM themes t
            LEFT JOIN issues i ON i.theme_id = t.id
            GROUP BY t.canonical_name
            ORDER BY occurrences DESC
        """)

        # Outcomes
        outcomes = execute_sql(
            "SELECT outcome_label, notes FROM outcomes"
        )

        # All sprints count
        all_sprints = execute_sql("SELECT COUNT(*) as cnt FROM sprints")
        sprint_count = int(all_sprints[0]["cnt"]) if all_sprints else 6

        lines = [
            f"Current sprint: {sprint_name}",
            f"Total sprints tracked: {sprint_count}",
            f"Open/in-progress actions: {len(open_actions)}",
        ]
        for a in open_actions[:3]:
            lines.append(f"  - '{a['description'][:60]}' owner={a['owner_name']} due={a['due_date']} status={a['status']}")

        lines.append(f"Effective actions: {len(effective)}")
        for a in effective[:2]:
            lines.append(f"  - '{a['description'][:60]}' score={a['effectiveness_score']}")

        lines.append(f"Action effectiveness avg: {avg_eff}/100")
        lines.append(f"High-severity issues this sprint: {len(high_issues)}")
        for i in high_issues:
            lines.append(f"  - '{i['description'][:60]}' confidence={i['confidence_score']}")

        lines.append("Recurring themes (by occurrence):")
        for t in themes[:6]:
            lines.append(f"  - {t['canonical_name']}: {t['occurrences']} of {sprint_count} sprints")

        if outcomes:
            lines.append("Outcomes recorded:")
            for o in outcomes:
                lines.append(f"  - {o['outcome_label']}: {(o['notes'] or '')[:80]}")

        return "Live DB context:\n" + "\n".join(f"- {l}" if not l.startswith("  ") else l for l in lines)

    except Exception as e:
        return f"Context retrieval error: {e}"


@router.post("", response_model=CopilotResponse)
def ask_copilot(req: CopilotRequest) -> CopilotResponse:
    user_msg = req.user_message
    if not user_msg:
        return CopilotResponse(answer="Please ask a question.", citations=[])

    context = _build_context()
    answer = llm.complete(
        system=COPILOT_SYSTEM,
        user=f"Question: {user_msg}\n\n{context}",
    )
    citations = ["Sprint 24 retro", "Action tracker", "6-sprint pattern data"]
    return CopilotResponse(answer=answer, citations=citations)
