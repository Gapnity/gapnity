"""Atlassian Jira Cloud client.

Handles:
  - OAuth 2.0 (3LO) token exchange and refresh
  - Accessible resources (cloud_id lookup)
  - Agile REST API: boards, sprints, issues
  - Issue status sync

Configuration (env vars):
  JIRA_CLIENT_ID      — from your Atlassian OAuth 2.0 app
  JIRA_CLIENT_SECRET  — from your Atlassian OAuth 2.0 app
  JIRA_REDIRECT_URI   — must match what's registered in Atlassian Developer Console
                        e.g. http://localhost:8000/api/integrations/jira/callback

Token storage is in-memory (keyed by team_id).  For production, persist tokens
in the database using the OAuthToken model.
"""
from __future__ import annotations

import json
import os
import pathlib
import secrets
import time
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode

import httpx

# ── Config — read dynamically so .env changes are picked up without full restart

def _client_id() -> str:
    return os.getenv("JIRA_CLIENT_ID", "")

def _client_secret() -> str:
    return os.getenv("JIRA_CLIENT_SECRET", "")

def _redirect_uri() -> str:
    return os.getenv("JIRA_REDIRECT_URI", "http://localhost:8000/api/integrations/jira/callback")

ATLASSIAN_AUTH_URL = "https://auth.atlassian.com/authorize"
ATLASSIAN_TOKEN_URL = "https://auth.atlassian.com/oauth/token"
ATLASSIAN_RESOURCES_URL = "https://api.atlassian.com/oauth/token/accessible-resources"

SCOPES = " ".join([
    "read:jira-work",
    "read:jira-user",
    "write:jira-work",
    "offline_access",
])

# ── Persistent token store ────────────────────────────────────────────────────
# Tokens are saved to a JSON file next to this module so they survive restarts.

_TOKEN_FILE = pathlib.Path(__file__).parent / ".jira_tokens.json"


def _load_tokens() -> Dict[str, Dict[str, Any]]:
    try:
        if _TOKEN_FILE.exists():
            return json.loads(_TOKEN_FILE.read_text())
    except Exception:
        pass
    return {}


def _save_tokens(tokens: Dict[str, Dict[str, Any]]) -> None:
    try:
        _TOKEN_FILE.write_text(json.dumps(tokens, indent=2))
    except Exception:
        pass


# In-memory cache — loaded from disk once at import time
_tokens: Dict[str, Dict[str, Any]] = _load_tokens()

# PKCE state store (state_token → team_id) – short-lived
_pending_states: Dict[str, str] = {}


# ── OAuth helpers ─────────────────────────────────────────────────────────────

def get_authorization_url(team_id: str) -> str:
    """Build the Atlassian OAuth authorization URL and stash the state."""
    state = secrets.token_urlsafe(24)
    _pending_states[state] = team_id
    params = {
        "audience": "api.atlassian.com",
        "client_id": _client_id(),
        "scope": SCOPES,
        "redirect_uri": _redirect_uri(),
        "state": state,
        "response_type": "code",
        "prompt": "consent",
    }
    return f"{ATLASSIAN_AUTH_URL}?{urlencode(params)}"


def exchange_code(code: str, state: str) -> Optional[str]:
    """Exchange authorization code for tokens.  Returns team_id on success."""
    team_id = _pending_states.pop(state, None)
    if not team_id:
        return None

    resp = httpx.post(
        ATLASSIAN_TOKEN_URL,
        json={
            "grant_type": "authorization_code",
            "client_id": _client_id(),
            "client_secret": _client_secret(),
            "code": code,
            "redirect_uri": _redirect_uri(),
        },
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()

    # Fetch the first accessible cloud site
    cloud_id, site_name, site_url = _fetch_cloud_info(data["access_token"])

    _tokens[team_id] = {
        "access_token": data["access_token"],
        "refresh_token": data.get("refresh_token"),
        "expires_at": time.time() + data.get("expires_in", 3600),
        "cloud_id": cloud_id,
        "site_name": site_name,
        "site_url": site_url,
        "scopes": data.get("scope", "").split(),
    }
    _save_tokens(_tokens)
    return team_id


def _fetch_cloud_info(access_token: str) -> tuple[str, str, str]:
    resp = httpx.get(
        ATLASSIAN_RESOURCES_URL,
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )
    resp.raise_for_status()
    resources = resp.json()
    if not resources:
        raise ValueError("No accessible Atlassian cloud sites found.")
    site = resources[0]
    return site["id"], site["name"], site["url"]


def _access_token(team_id: str) -> str:
    """Return a valid access token, refreshing if needed."""
    tok = _tokens.get(team_id)
    if not tok:
        raise ValueError(f"No Jira connection for team {team_id!r}")

    if time.time() < tok["expires_at"] - 60:
        return tok["access_token"]

    # Refresh
    resp = httpx.post(
        ATLASSIAN_TOKEN_URL,
        json={
            "grant_type": "refresh_token",
            "client_id": _client_id(),
            "client_secret": _client_secret(),
            "refresh_token": tok["refresh_token"],
        },
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()
    tok["access_token"] = data["access_token"]
    tok["expires_at"] = time.time() + data.get("expires_in", 3600)
    if "refresh_token" in data:
        tok["refresh_token"] = data["refresh_token"]
    _save_tokens(_tokens)
    return tok["access_token"]


def disconnect(team_id: str) -> None:
    _tokens.pop(team_id, None)
    _save_tokens(_tokens)


def get_status(team_id: str) -> Dict[str, Any]:
    tok = _tokens.get(team_id)
    if not tok:
        return {"connected": False}
    return {
        "connected": True,
        "site_name": tok.get("site_name"),
        "site_url": tok.get("site_url"),
        "cloud_id": tok.get("cloud_id"),
        "scopes": tok.get("scopes", []),
    }


# ── Jira Agile API helpers ────────────────────────────────────────────────────

def _agile_get(team_id: str, path: str, params: Optional[Dict] = None) -> Any:
    tok = _tokens[team_id]
    cloud_id = tok["cloud_id"]
    url = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/agile/1.0{path}"
    resp = httpx.get(
        url,
        headers={"Authorization": f"Bearer {_access_token(team_id)}",
                 "Accept": "application/json"},
        params=params or {},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


def _jira_get(team_id: str, path: str, params: Optional[Dict] = None) -> Any:
    """Jira REST API v3 (non-agile) — GET."""
    tok = _tokens[team_id]
    cloud_id = tok["cloud_id"]
    url = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3{path}"
    resp = httpx.get(
        url,
        headers={"Authorization": f"Bearer {_access_token(team_id)}",
                 "Accept": "application/json"},
        params=params or {},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


def _jira_post(team_id: str, path: str, body: Dict) -> Any:
    """Jira REST API v3 — POST with JSON body."""
    tok = _tokens[team_id]
    cloud_id = tok["cloud_id"]
    url = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3{path}"
    resp = httpx.post(
        url,
        headers={
            "Authorization": f"Bearer {_access_token(team_id)}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        json=body,
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


# ── Public API ────────────────────────────────────────────────────────────────

def list_boards(team_id: str) -> List[Dict[str, Any]]:
    """List Jira boards.  Falls back to projects if the Agile API is not accessible."""
    try:
        data = _agile_get(team_id, "/board")
        boards = []
        for b in data.get("values", []):
            boards.append({
                "id": b["id"],
                "name": b["name"],
                "type": b["type"],
                "project_key": b.get("location", {}).get("projectKey"),
            })
        return boards
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in (401, 403):
            # Agile board API not available (e.g. Jira Work Management site or
            # missing Jira Software subscription).  Fall back to REST v3 projects.
            return _list_projects_as_boards(team_id)
        raise


def _list_projects_as_boards(team_id: str) -> List[Dict[str, Any]]:
    """Return Jira projects as pseudo-boards (fallback for non-Jira-Software sites)."""
    data = _jira_get(team_id, "/project/search", {"maxResults": 50})
    boards = []
    for p in data.get("values", []):
        boards.append({
            "id": int(p["id"]),
            "name": p["name"],
            "type": p.get("projectTypeKey", "software"),
            "project_key": p["key"],
        })
    return boards


def _board_id_for_project(team_id: str, project_key: str) -> Optional[int]:
    """Find the first Agile board for a project key.  Returns None if not found."""
    try:
        data = _agile_get(team_id, "/board", {"projectKeyOrId": project_key, "maxResults": 1})
        values = data.get("values", [])
        return values[0]["id"] if values else None
    except Exception:
        return None


def list_sprints(team_id: str, board_id: int) -> List[Dict[str, Any]]:
    """List sprints for a board.  Falls back to JQL-based pseudo-sprints when Agile API is unavailable."""
    # First, try to find a real Agile board for this ID (handles project-fallback IDs too)
    real_board_id = _resolve_to_agile_board(team_id, board_id)

    if real_board_id is None:
        # Agile API completely unavailable — synthesise pseudo-sprints from project issues
        return _synthesise_sprints_from_project(team_id, board_id)

    try:
        data = _agile_get(team_id, f"/board/{real_board_id}/sprint",
                          params={"state": "active,closed,future", "maxResults": 20})
        sprints = []
        for s in data.get("values", []):
            sprints.append({
                "id": s["id"],
                "name": s["name"],
                "state": s["state"],
                "start_date": s.get("startDate"),
                "end_date": s.get("endDate"),
                "complete_date": s.get("completeDate"),
            })
        return sorted(sprints, key=lambda s: s["id"], reverse=True)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in (401, 403, 404):
            return _synthesise_sprints_from_project(team_id, board_id)
        raise


def _resolve_to_agile_board(team_id: str, board_id: int) -> Optional[int]:
    """Return the real Agile board ID to use.
    - If the Agile API works and /board/{board_id} exists, return board_id.
    - If board_id is a project ID (fallback mode), find the project's first board.
    - If the Agile API is completely unavailable (site-wide 401), return None.
    """
    # Try a direct board lookup
    try:
        _agile_get(team_id, f"/board/{board_id}")
        return board_id  # It's a valid Agile board
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            # Board not found by this ID — might be a project ID; keep trying
            pass
        elif exc.response.status_code in (401, 403):
            # Agile API completely blocked for this site — signal with None
            return None
        else:
            raise
    except Exception:
        pass

    # Try to resolve project ID → board
    try:
        project = _jira_get(team_id, f"/project/{board_id}")
        project_key = project.get("key")
        if project_key:
            resolved = _board_id_for_project(team_id, project_key)
            if resolved:
                return resolved
    except Exception:
        pass

    return None  # Could not resolve — signal fallback needed


def _synthesise_sprints_from_project(team_id: str, project_id: int) -> List[Dict[str, Any]]:
    """When no Agile boards/sprints exist, return project versions as pseudo-sprints.
    Falls back to a single synthetic 'All Issues' sprint if no versions exist."""
    try:
        project = _jira_get(team_id, f"/project/{project_id}")
        project_key = project.get("key", str(project_id))
        versions_data = _jira_get(team_id, f"/project/{project_key}/versions")
        sprints = []
        for v in versions_data:
            # Map released → closed, unreleased → active/future
            if v.get("released"):
                state = "closed"
            elif v.get("archived"):
                state = "closed"
            else:
                state = "active"
            sprints.append({
                "id": int(v["id"]),
                "name": v["name"],
                "state": state,
                "start_date": v.get("startDate"),
                "end_date": v.get("releaseDate"),
                "complete_date": v.get("releaseDate") if v.get("released") else None,
            })
        if sprints:
            return sorted(sprints, key=lambda s: s["id"], reverse=True)
    except Exception:
        pass

    # Last resort: single synthetic sprint representing all project issues
    return [{
        "id": project_id,
        "name": "All Issues",
        "state": "active",
        "start_date": None,
        "end_date": None,
        "complete_date": None,
    }]


def get_sprint_issues(team_id: str, board_id: int, sprint_id: int) -> List[Dict[str, Any]]:
    real_board_id = _resolve_to_agile_board(team_id, board_id)

    if real_board_id is not None:
        try:
            data = _agile_get(
                team_id,
                f"/board/{real_board_id}/sprint/{sprint_id}/issue",
                params={"maxResults": 100, "fields": "summary,status,issuetype,assignee,labels,customfield_10016"},
            )
            return _parse_issues(data.get("issues", []))
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code not in (401, 403, 404):
                raise

    # Fallback: fetch issues via JQL (works for project versions or synthetic sprints)
    return _get_issues_by_jql(team_id, board_id, sprint_id)


def _get_issues_by_jql(team_id: str, project_id: int, sprint_or_version_id: int) -> List[Dict[str, Any]]:
    """Fetch issues using JQL — used when Agile API is unavailable."""
    try:
        project = _jira_get(team_id, f"/project/{project_id}")
        project_key = project.get("key", str(project_id))
    except Exception:
        project_key = str(project_id)

    # Try fixVersion filter first (for version-based sprints)
    # If sprint_id == project_id, it's the synthetic "All Issues" sprint
    if sprint_or_version_id == project_id:
        jql = f"project = {project_key} ORDER BY created DESC"
    else:
        jql = f"project = {project_key} AND fixVersion = {sprint_or_version_id} ORDER BY created DESC"

    # Use POST /search/jql — the old GET /search endpoint returns 410 on newer Jira Cloud
    data = _jira_post(team_id, "/search/jql", {
        "jql": jql,
        "maxResults": 100,
        "fields": ["summary", "status", "issuetype", "assignee", "labels", "customfield_10016"],
    })
    return _parse_issues(data.get("issues", []))


def _parse_issues(raw_issues: list) -> List[Dict[str, Any]]:
    issues = []
    for item in raw_issues:
        f = item.get("fields") or {}
        assignee = None
        if f.get("assignee"):
            assignee = f["assignee"].get("displayName")
        # story_points: stored as customfield_10016 (float/int) or None
        sp_raw = f.get("customfield_10016")
        story_points: float | None = None
        if sp_raw is not None:
            try:
                story_points = float(sp_raw)
            except (TypeError, ValueError):
                story_points = None
        issues.append({
            "id": str(item.get("id", "")),
            "key": item.get("key", ""),
            "summary": f.get("summary") or "(no summary)",
            "status": (f.get("status") or {}).get("name") or "Unknown",
            "issue_type": (f.get("issuetype") or {}).get("name") or "Task",
            "assignee": assignee,
            "story_points": story_points,
            "labels": f.get("labels") or [],
        })
    return issues


def sync_issue_statuses(
    team_id: str,
    board_id: int,
    sprint_id: int,
    previous: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """Compare current Jira statuses against `previous` snapshot.
    Returns a list of change records."""
    current = get_sprint_issues(team_id, board_id, sprint_id)
    prev_map = {i["key"]: i["status"] for i in previous}
    results = []
    for issue in current:
        prev_status = prev_map.get(issue["key"], "Unknown")
        results.append({
            "key": issue["key"],
            "summary": issue["summary"],
            "previous_status": prev_status,
            "current_status": issue["status"],
            "changed": prev_status != issue["status"],
        })
    return results
