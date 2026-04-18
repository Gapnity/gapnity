from typing import List
from fastapi import APIRouter, HTTPException

from app.schemas.models import (
    Sprint, SprintDetail, SprintComparison, Issue, ActionItem,
)

router = APIRouter()

# --- Fixture data. Replace with DB-backed queries. ---------------------------
SPRINTS: List[Sprint] = [
    Sprint(id="s24", team_id="t1", name="Sprint 24",
           start_date="2026-04-06", end_date="2026-04-17", state="active"),
    Sprint(id="s23", team_id="t1", name="Sprint 23",
           start_date="2026-03-23", end_date="2026-04-03", state="closed"),
    Sprint(id="s22", team_id="t1", name="Sprint 22",
           start_date="2026-03-09", end_date="2026-03-20", state="closed"),
]


@router.get("", response_model=List[Sprint])
def list_sprints() -> List[Sprint]:
    return SPRINTS


@router.get("/{sprint_id}", response_model=SprintDetail)
def get_sprint(sprint_id: str) -> SprintDetail:
    sprint = next((s for s in SPRINTS if s.id == sprint_id), None)
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")

    issues = [
        Issue(id="i1", sprint_id=sprint_id, theme_id="th-env",
              description="Staging environment flaky; blocks QA verification",
              severity="high", confidence_score=0.88,
              evidence=["Standup 04/08: 'env down ~2h'",
                        "Standup 04/11: 'deploy failed, rolled back'"]),
        Issue(id="i2", sprint_id=sprint_id, theme_id="th-ac",
              description="Ambiguous acceptance criteria on checkout flow",
              severity="medium", confidence_score=0.74,
              evidence=["Retro: 'PO clarified mid-sprint'",
                        "PR #812 reopened after review"]),
        Issue(id="i3", sprint_id=sprint_id, theme_id="th-flaky",
              description="Regression suite flakiness on payment gateway mocks",
              severity="high", confidence_score=0.81,
              evidence=["CI logs: 6 retries in 4 runs",
                        "Slack #qa: 'same test again'"]),
    ]

    actions = [
        ActionItem(id="a1", sprint_id=sprint_id, issue_id="i1",
                   description="Stabilize staging: containerize DB seeds + health-check retry",
                   owner_name="Priya", due_date="2026-04-22", status="in_progress"),
        ActionItem(id="a2", sprint_id=sprint_id, issue_id="i2",
                   description="PO pre-reads stories 48h before sprint start",
                   owner_name="Arjun", due_date="2026-04-20", status="new"),
    ]

    comparison = SprintComparison(
        prev_sprint_name="Sprint 23",
        recurring_themes=["Environment instability", "Flaky automation"],
        newly_introduced=["Ambiguous acceptance criteria (checkout)"],
        improved=["Review turnaround time"],
        unresolved_actions=3,
        contradictions=["Planning assumed stable staging; 3 incidents occurred in execution"],
    )

    return SprintDetail(
        sprint=sprint,
        went_well=["Team shipped checkout v2 ahead of demo",
                   "Pair rotation reduced review time by ~30%"],
        did_not_go_well=["Staging downtime blocked QA twice",
                         "Acceptance criteria rewritten mid-sprint",
                         "Two stories carried over to Sprint 25"],
        decisions=["Adopt pre-sprint story grooming 48h before planning",
                   "Pin payment gateway mock version"],
        issues=issues,
        actions=actions,
        comparison=comparison,
    )
