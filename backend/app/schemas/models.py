"""Pydantic I/O schemas. Mirror the entity model from the product pack (§11)."""
from __future__ import annotations

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


Severity = Literal["low", "medium", "high", "critical"]
ActionStatus = Literal["new", "in_progress", "completed", "effective", "not_effective"]
MeetingType = Literal["retro", "standup", "planning", "review", "grooming"]


class AnalyzeRequest(BaseModel):
    sprint_id: str
    meeting_type: MeetingType
    transcript: str = Field(..., min_length=1)


class ActionItem(BaseModel):
    id: Optional[str] = None
    sprint_id: Optional[str] = None
    issue_id: Optional[str] = None
    description: str
    owner_name: Optional[str] = None
    due_date: Optional[str] = None
    status: ActionStatus = "new"
    effectiveness_score: Optional[int] = None   # 0..100


class Issue(BaseModel):
    id: Optional[str] = None
    sprint_id: Optional[str] = None
    theme_id: Optional[str] = None
    description: str
    severity: Severity = "medium"
    confidence_score: float = 0.75              # 0..1
    evidence: List[str] = []


class Decision(BaseModel):
    id: Optional[str] = None
    description: str


class RetroSummary(BaseModel):
    went_well: List[str] = []
    did_not_go_well: List[str] = []
    decisions: List[str] = []
    risks: List[str] = []
    open_questions: List[str] = []


class AnalyzeResponse(BaseModel):
    summary: RetroSummary
    themes: List[str]
    issues: List[Issue]
    actions: List[ActionItem]


class Theme(BaseModel):
    id: str
    canonical_name: str
    description: str
    occurrences: int


class Sprint(BaseModel):
    id: str
    team_id: str
    name: str
    start_date: str
    end_date: str
    state: Literal["planning", "active", "closed"] = "active"


class SprintComparison(BaseModel):
    prev_sprint_name: str
    recurring_themes: List[str]
    newly_introduced: List[str]
    improved: List[str]
    unresolved_actions: int
    contradictions: List[str]


class SprintDetail(BaseModel):
    sprint: Sprint
    went_well: List[str]
    did_not_go_well: List[str]
    decisions: List[str]
    issues: List[Issue]
    actions: List[ActionItem]
    comparison: SprintComparison


class DashboardMetrics(BaseModel):
    sprint_name: str
    completion_rate: float                    # 0..1
    action_effectiveness: int                 # 0..100
    team_health: int                          # 0..100
    improvement_score: int                    # 0..100
    delivery_risk: Literal["low", "medium", "high"]
    risk_signals: List[str]


class MemoryNode(BaseModel):
    id: str
    label: str
    kind: Literal["theme", "issue", "action", "owner", "outcome", "sprint"]


class MemoryEdge(BaseModel):
    from_: str = Field(..., alias="from")
    to: str
    kind: Literal["causes", "owns", "addresses", "resolves", "belongs_to"]

    class Config:
        populate_by_name = True


class MemoryGraph(BaseModel):
    nodes: List[MemoryNode]
    edges: List[MemoryEdge]


class CopilotRequest(BaseModel):
    question: str
    context: Optional[str] = "last_6_sprints"


class CopilotResponse(BaseModel):
    answer: str
    citations: List[str] = []
