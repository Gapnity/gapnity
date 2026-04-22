"""Pydantic schemas for the Jira integration."""
from __future__ import annotations

from typing import List, Literal, Optional
from pydantic import BaseModel


# ── OAuth / connection ────────────────────────────────────────────────────────

class JiraConnectionStatus(BaseModel):
    connected: bool
    site_name: Optional[str] = None
    site_url: Optional[str] = None
    cloud_id: Optional[str] = None
    scopes: List[str] = []


# ── Jira resources ────────────────────────────────────────────────────────────

class JiraBoard(BaseModel):
    id: int
    name: str
    type: str                           # "scrum" | "kanban"
    project_key: Optional[str] = None


class JiraSprint(BaseModel):
    id: int
    name: str
    state: Literal["active", "closed", "future"]
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    complete_date: Optional[str] = None


class JiraIssue(BaseModel):
    id: str
    key: str                            # e.g. "PROJ-123"
    summary: str
    status: str                         # e.g. "To Do", "In Progress", "Done"
    issue_type: str
    assignee: Optional[str] = None
    story_points: Optional[float] = None
    labels: List[str] = []


# ── Import ────────────────────────────────────────────────────────────────────

class ImportRequest(BaseModel):
    board_id: int
    sprint_id: int
    team_id: str = "platform"


class ImportedSprint(BaseModel):
    sprint: JiraSprint
    issues: List[JiraIssue]
    total: int
    imported: int


# ── Sync ──────────────────────────────────────────────────────────────────────

class SyncRequest(BaseModel):
    board_id: int
    sprint_id: int


class SyncedIssue(BaseModel):
    key: str
    summary: str
    previous_status: str
    current_status: str
    changed: bool


class SyncResponse(BaseModel):
    synced: int
    changed: int
    issues: List[SyncedIssue]
