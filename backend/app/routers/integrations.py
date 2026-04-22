"""Jira integration router.

Endpoints:
  GET  /api/integrations/jira/authorize        → redirect to Atlassian OAuth
  GET  /api/integrations/jira/callback         → exchange code, store tokens
  GET  /api/integrations/jira/status           → connection status
  DELETE /api/integrations/jira/disconnect     → remove connection
  GET  /api/integrations/jira/boards           → list Jira boards
  GET  /api/integrations/jira/boards/{board_id}/sprints  → list sprints
  POST /api/integrations/jira/import           → import sprint + issues
  POST /api/integrations/jira/sync             → sync issue statuses
"""
from __future__ import annotations

import os
from typing import List

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse

from app.schemas.jira import (
    JiraBoard, JiraConnectionStatus, JiraIssue, JiraSprint,
    ImportRequest, ImportedSprint, SyncRequest, SyncResponse, SyncedIssue,
)
from app.services import jira_client as jira

router = APIRouter()

# In-memory cache of last-imported issue snapshots for sync diffing
# { (team_id, board_id, sprint_id) → list[dict] }
_import_cache: dict = {}

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


# ── OAuth ─────────────────────────────────────────────────────────────────────

@router.get("/jira/authorize")
def jira_authorize(team_id: str = Query(default="platform")):
    """Redirect the browser to Atlassian's consent screen."""
    if not os.getenv("JIRA_CLIENT_ID"):
        raise HTTPException(
            status_code=501,
            detail=(
                "Jira OAuth is not configured. "
                "Set JIRA_CLIENT_ID, JIRA_CLIENT_SECRET, and JIRA_REDIRECT_URI "
                "in your backend .env file, then restart."
            ),
        )
    url = jira.get_authorization_url(team_id)
    return RedirectResponse(url)


@router.get("/jira/callback")
def jira_callback(code: str = Query(...), state: str = Query(...)):
    """Handle Atlassian OAuth callback, exchange code for tokens."""
    try:
        team_id = jira.exchange_code(code, state)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"OAuth exchange failed: {exc}") from exc

    if not team_id:
        raise HTTPException(status_code=400, detail="Invalid OAuth state. Please try connecting again.")

    # Redirect back to the integrations page in the frontend
    return RedirectResponse(f"{FRONTEND_URL}/integrations/jira?connected=true")


@router.get("/jira/status", response_model=JiraConnectionStatus)
def jira_status(team_id: str = Query(default="platform")):
    return jira.get_status(team_id)


@router.delete("/jira/disconnect")
def jira_disconnect(team_id: str = Query(default="platform")):
    jira.disconnect(team_id)
    return {"ok": True}


# ── Boards & Sprints ──────────────────────────────────────────────────────────

@router.get("/jira/boards", response_model=List[JiraBoard])
def list_boards(team_id: str = Query(default="platform")):
    _require_connection(team_id)
    try:
        return jira.list_boards(team_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/jira/boards/{board_id}/sprints", response_model=List[JiraSprint])
def list_sprints(board_id: int, team_id: str = Query(default="platform")):
    _require_connection(team_id)
    try:
        return jira.list_sprints(team_id, board_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ── Import ────────────────────────────────────────────────────────────────────

@router.post("/jira/import", response_model=ImportedSprint)
def import_sprint(body: ImportRequest):
    _require_connection(body.team_id)
    try:
        sprints = jira.list_sprints(body.team_id, body.board_id)
        sprint_data = next((s for s in sprints if s["id"] == body.sprint_id), None)
        if not sprint_data:
            raise HTTPException(status_code=404, detail=f"Sprint {body.sprint_id} not found on board {body.board_id}")

        issues_raw = jira.get_sprint_issues(body.team_id, body.board_id, body.sprint_id)

        # Cache for later sync diffing
        cache_key = (body.team_id, body.board_id, body.sprint_id)
        _import_cache[cache_key] = issues_raw

        issues = [JiraIssue(**i) for i in issues_raw]
        return ImportedSprint(
            sprint=JiraSprint(**sprint_data),
            issues=issues,
            total=len(issues),
            imported=len(issues),
        )
    except HTTPException:
        raise
    except Exception as exc:
        import traceback
        raise HTTPException(status_code=502, detail=f"{type(exc).__name__}: {exc}\n{traceback.format_exc()}") from exc


# ── Sync ──────────────────────────────────────────────────────────────────────

@router.post("/jira/sync", response_model=SyncResponse)
def sync_sprint(body: SyncRequest, team_id: str = Query(default="platform")):
    _require_connection(team_id)
    try:
        cache_key = (team_id, body.board_id, body.sprint_id)
        previous = _import_cache.get(cache_key, [])

        diffs = jira.sync_issue_statuses(team_id, body.board_id, body.sprint_id, previous)

        # Update cache with fresh data
        _import_cache[cache_key] = [
            {"key": d["key"], "summary": d["summary"], "status": d["current_status"]}
            for d in diffs
        ]

        changed = [d for d in diffs if d["changed"]]
        return SyncResponse(
            synced=len(diffs),
            changed=len(changed),
            issues=[SyncedIssue(**d) for d in diffs],
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ── Helpers ───────────────────────────────────────────────────────────────────

def _require_connection(team_id: str) -> None:
    status = jira.get_status(team_id)
    if not status["connected"]:
        raise HTTPException(
            status_code=403,
            detail="Jira is not connected. Visit /api/integrations/jira/authorize to connect.",
        )
