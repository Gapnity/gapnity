"""Meeting extractor — stitches the prompt library + LLM into one call."""
from __future__ import annotations

from typing import Any, Dict, List

from app.prompts import library as P
from app.schemas.models import (
    ActionItem, AnalyzeRequest, AnalyzeResponse, Issue, RetroSummary,
)
from app.services.llm import llm


def analyze_transcript(req: AnalyzeRequest) -> AnalyzeResponse:
    # 1. Summary
    summary_raw = llm.complete_json(P.RETRO_SUMMARIZATION, _user_block(req)) or {}
    summary = RetroSummary(**{k: summary_raw.get(k, []) for k in RetroSummary.model_fields})

    # 2. Themes
    themes_raw = llm.complete_json(P.THEME_EXTRACTION, _user_block(req)) or []
    themes: List[str] = [t.get("theme_name", "") for t in themes_raw if isinstance(t, dict)]

    # 3. Root causes → issues
    causes_raw = llm.complete_json(P.ROOT_CAUSE_EXTRACTION, _user_block(req)) or []
    issues: List[Issue] = []
    for c in causes_raw if isinstance(causes_raw, list) else []:
        if not isinstance(c, dict):
            continue
        issues.append(Issue(
            description=c.get("issue", "")[:500],
            severity="high" if (c.get("confidence") or 0) >= 0.8 else "medium",
            confidence_score=float(c.get("confidence", 0.5)),
            evidence=list(c.get("evidence", []))[:5],
        ))

    # 4. Actions
    actions_raw = llm.complete_json(P.ACTION_EXTRACTION, _user_block(req)) or []
    actions: List[ActionItem] = []
    for a in actions_raw if isinstance(actions_raw, list) else []:
        if not isinstance(a, dict):
            continue
        actions.append(ActionItem(
            sprint_id=req.sprint_id,
            description=a.get("description", "")[:500],
            owner_name=a.get("owner"),
            due_date=a.get("due_date"),
        ))

    return AnalyzeResponse(summary=summary, themes=themes, issues=issues, actions=actions)


def _user_block(req: AnalyzeRequest) -> str:
    return (
        f"Meeting type: {req.meeting_type}\n"
        f"Sprint id: {req.sprint_id}\n"
        f"Transcript:\n---\n{req.transcript}\n---"
    )
