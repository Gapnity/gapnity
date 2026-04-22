// Thin API client. Falls back to mock data when the backend is unreachable,
// so the UI is always demo-able out of the box.

import { mockDashboard, mockSprint, mockSprints, mockThemes, mockActions, mockGraph } from "./mockData";
import type {
  DashboardMetrics, Sprint, Theme, ActionItem, MemoryGraph, Issue, CopilotResponse,
} from "./types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJSON<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API}${path}`, { cache: "no-store", ...init });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export const api = {
  // ── fixed: teamId defaults to "platform" (was "demo") ──────────────────────
  dashboard: (teamId = "platform") =>
    fetchJSON<DashboardMetrics>(`/api/dashboard/team/${teamId}`, mockDashboard),

  sprints: () => fetchJSON<Sprint[]>(`/api/sprints`, mockSprints),

  sprint: (id: string) =>
    fetchJSON(`/api/sprints/${id}`, {
      sprint: mockSprint,
      issues: mockSprint.issues as Issue[],
      actions: mockActions,
      comparison: mockSprint.comparison,
    }),

  themes: () => fetchJSON<Theme[]>(`/api/themes/recurring`, mockThemes),

  actions: () => fetchJSON<ActionItem[]>(`/api/actions`, mockActions),

  memoryGraph: () => fetchJSON<MemoryGraph>(`/api/memory/graph`, mockGraph),

  askCopilot: (payload: { question?: string; message?: string; context?: string }) =>
    fetch(`${API}/api/copilot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .catch((): CopilotResponse => ({
        answer:
          "Sprint 24 summary: delivery improved, but environment instability and flaky automation still showed up as recurring blockers. The most important follow-up is stabilizing staging while preserving the faster review cadence from this sprint.",
        citations: ["Sprint 24 retro", "Staging action", "Recent CI trend"],
      })),

  analyzeTranscript: (payload: { sprint_id: string; meeting_type: string; transcript: string }) =>
    fetch(`${API}/api/meetings/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.json()).catch(() => ({ ok: false })),

  // ── Jira integration ────────────────────────────────────────────────────────
  jira: {
    status: (teamId = "platform") =>
      fetchJSON(`/api/integrations/jira/status?team_id=${teamId}`, { connected: false }),

    authorizeUrl: (teamId = "platform") =>
      `${API}/api/integrations/jira/authorize?team_id=${teamId}`,

    disconnect: (teamId = "platform") =>
      fetch(`${API}/api/integrations/jira/disconnect?team_id=${teamId}`, { method: "DELETE" })
        .then((r) => r.json()).catch(() => ({ ok: false })),

    boards: (teamId = "platform") =>
      fetchJSON(`/api/integrations/jira/boards?team_id=${teamId}`, [] as JiraBoard[]),

    sprints: (boardId: number, teamId = "platform") =>
      fetchJSON(`/api/integrations/jira/boards/${boardId}/sprints?team_id=${teamId}`, [] as JiraSprint[]),

    importSprint: (payload: { board_id: number; sprint_id: number; team_id?: string }) =>
      fetch(`${API}/api/integrations/jira/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: "platform", ...payload }),
      }).then((r) => r.json()),

    sync: (payload: { board_id: number; sprint_id: number }, teamId = "platform") =>
      fetch(`${API}/api/integrations/jira/sync?team_id=${teamId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => r.json()),
  },
};

// ── Jira types (used only in the frontend) ───────────────────────────────────
export interface JiraBoard {
  id: number;
  name: string;
  type: string;
  project_key: string | null;
}

export interface JiraSprint {
  id: number;
  name: string;
  state: "active" | "closed" | "future";
  start_date: string | null;
  end_date: string | null;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  status: string;
  issue_type: string;
  assignee: string | null;
  story_points: number | null;
  labels: string[];
}

export interface JiraConnectionStatus {
  connected: boolean;
  site_name?: string;
  site_url?: string;
  cloud_id?: string;
  scopes?: string[];
}

export interface ImportedSprint {
  sprint: JiraSprint;
  issues: JiraIssue[];
  total: number;
  imported: number;
}

export interface SyncResponse {
  synced: number;
  changed: number;
  issues: {
    key: string;
    summary: string;
    previous_status: string;
    current_status: string;
    changed: boolean;
  }[];
}
