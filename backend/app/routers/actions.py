from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.schemas.models import ActionItem
from app.services.scorer import action_effectiveness

router = APIRouter()

_ACTIONS: List[ActionItem] = [
    ActionItem(id="a1", sprint_id="s24", issue_id="i1",
               description="Stabilize staging: containerize DB seeds + health-check retry",
               owner_name="Priya", due_date="2026-04-22", status="in_progress"),
    ActionItem(id="a2", sprint_id="s24", issue_id="i2",
               description="PO pre-reads stories 48h before sprint start",
               owner_name="Arjun", due_date="2026-04-20", status="new"),
    ActionItem(id="a3", sprint_id="s23", issue_id="i3",
               description="Isolate payment-gateway tests with deterministic fixtures",
               owner_name="Mei", due_date="2026-04-02", status="completed",
               effectiveness_score=78),
    ActionItem(id="a4", sprint_id="s22",
               description="Reduce WIP limit to 4 per engineer",
               owner_name="Ishan", due_date="2026-03-18", status="effective",
               effectiveness_score=84),
    ActionItem(id="a5", sprint_id="s22",
               description="Split planning into scoping + estimation sessions",
               owner_name="Lena", due_date="2026-03-19", status="not_effective",
               effectiveness_score=31),
]


@router.get("", response_model=List[ActionItem])
def list_actions() -> List[ActionItem]:
    return _ACTIONS


class EvaluateRequest(BaseModel):
    completed: bool = False
    on_time: bool = False
    issue_recurrence_reduced: bool = False
    sprint_kpi_improved: bool = False
    sentiment_improved: bool = False


@router.post("/{action_id}/evaluate", response_model=ActionItem)
def evaluate_action(action_id: str, payload: EvaluateRequest) -> ActionItem:
    action = next((a for a in _ACTIONS if a.id == action_id), None)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    score = action_effectiveness(**payload.model_dump())
    action.effectiveness_score = score
    action.status = "effective" if score >= 70 else ("not_effective" if score < 40 else "completed")
    return action
