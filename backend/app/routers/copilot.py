"""Copilot router — handles chat requests from the AI Copilot page."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.base import get_db
from app.prompts.library import COPILOT_SYSTEM
from app.schemas.models import CopilotResponse
from app.services.llm import llm

router = APIRouter()


class CopilotRequest(BaseModel):
    # Support both field names used across the codebase
    question: Optional[str] = None
    message: Optional[str] = None
    history: Optional[List[dict]] = []
    context: Optional[dict] = {}

    @property
    def user_message(self) -> str:
        return self.question or self.message or ""


def _build_context(db: Session | None) -> str:
    if db is None:
        return (
            "Memory snapshot (fixture):\n"
            "- Theme 'Environment instability': 5/6 recent sprints, 3 incidents this sprint.\n"
            "- Action 'Stabilize staging' owner=Priya status=in_progress due=2026-04-22.\n"
            "- Flaky rate: -62% S23→S24 after 'deterministic fixtures' action.\n"
            "- Team health: 72/100. Action effectiveness: 64/100. Improvement score: 58/100.\n"
            "- Recurring themes: Environment instability, Flaky automation, Unclear AC, Story carryover.\n"
            "- Sprint 24 contradiction: Planning assumed stable staging; 3 incidents occurred."
        )

    from app.db.models import Sprint, Action, Issue, Theme, Outcome
    try:
        sprints = db.query(Sprint).order_by(Sprint.id).all()
        actions = db.query(Action).all()
        issues = db.query(Issue).all()
        themes = db.query(Theme).all()
        outcomes = db.query(Outcome).all()

        active = next((s for s in sprints if s.state == "active"), None)
        sprint_name = active.name if active else "Sprint 24"

        open_actions = [a for a in actions if a.status in ("new", "in_progress")]
        effective = [a for a in actions if a.status == "effective"]
        high_issues = [i for i in issues if i.severity == "high"]

        lines = [
            f"Current sprint: {sprint_name}",
            f"Total sprints in DB: {len(sprints)}",
            f"Open actions: {len(open_actions)} — {', '.join(a.description[:50] for a in open_actions[:3])}",
            f"Effective actions: {len(effective)} — {', '.join(a.description[:40] for a in effective[:2])}",
            f"High-severity issues this sprint: {len(high_issues)}",
            f"Themes tracked: {', '.join(t.canonical_name for t in themes)}",
        ]
        if outcomes:
            lines.append(f"Outcomes recorded: {', '.join(o.outcome_label for o in outcomes)}")

        return "Live DB context:\n" + "\n".join(f"- {l}" for l in lines)
    except Exception as e:
        return f"Context retrieval error: {e}"


@router.post("", response_model=CopilotResponse)
def ask_copilot(req: CopilotRequest, db: Session = Depends(get_db)) -> CopilotResponse:
    user_msg = req.user_message
    if not user_msg:
        return CopilotResponse(answer="Please ask a question.", citations=[])

    context = _build_context(db)
    answer = llm.complete(
        system=COPILOT_SYSTEM,
        user=f"Question: {user_msg}\n\n{context}",
    )
    citations = ["Sprint 24 retro", "Action tracker", "6-sprint pattern data"]
    return CopilotResponse(answer=answer, citations=citations)
