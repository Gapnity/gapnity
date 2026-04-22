"use client";

// Jira integration page — OAuth 2.0 connect, board/sprint selector, import & sync.

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Loader2,
  RefreshCw,
  Unplug,
  Zap,
} from "lucide-react";
import type {
  JiraBoard,
  JiraConnectionStatus,
  JiraIssue,
  JiraSprint,
  ImportedSprint,
  SyncResponse,
} from "@/lib/api";
import { api } from "@/lib/api";

// ── helpers ───────────────────────────────────────────────────────────────────

function statusChip(state: JiraSprint["state"]) {
  const map: Record<string, string> = {
    active: "bg-emerald-soft text-emerald",
    closed: "bg-bg-hover text-ink-secondary",
    future: "bg-sky-soft text-sky",
  };
  return (
    <span className={`chip ${map[state] ?? "bg-bg-hover text-ink-secondary"}`}>
      {state}
    </span>
  );
}

function issueTypeDot(type: string) {
  const colors: Record<string, string> = {
    Story: "bg-emerald",
    Bug: "bg-rose",
    Task: "bg-sky",
    Epic: "bg-accent",
    "Sub-task": "bg-amber",
  };
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${colors[type] ?? "bg-ink-muted"}`}
      title={type}
    />
  );
}

function storyPointsBadge(pts: number | null) {
  if (pts == null) return null;
  return (
    <span className="chip bg-bg-hover text-ink-secondary">{pts} pts</span>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function JiraIntegrationPage() {
  const [status, setStatus] = useState<JiraConnectionStatus>({ connected: false });
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [boards, setBoards] = useState<JiraBoard[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<JiraBoard | null>(null);
  const [boardsOpen, setBoardsOpen] = useState(false);

  const [sprints, setSprints] = useState<JiraSprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<JiraSprint | null>(null);
  const [sprintsOpen, setSprintsOpen] = useState(false);
  const [loadingSprints, setLoadingSprints] = useState(false);

  const [importResult, setImportResult] = useState<ImportedSprint | null>(null);
  const [importing, setImporting] = useState(false);

  const [syncResult, setSyncResult] = useState<SyncResponse | null>(null);
  const [syncing, setSyncing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ── load connection status on mount (and after OAuth redirect) ───────────
  const loadStatus = useCallback(async () => {
    setLoadingStatus(true);
    const s = await api.jira.status();
    setStatus(s as JiraConnectionStatus);
    setLoadingStatus(false);
  }, []);

  useEffect(() => {
    loadStatus();
    // If we're back from OAuth, clear the query param
    if (typeof window !== "undefined") {
      const u = new URL(window.location.href);
      if (u.searchParams.has("connected")) {
        u.searchParams.delete("connected");
        window.history.replaceState({}, "", u.toString());
      }
    }
  }, [loadStatus]);

  // ── load boards once connected ───────────────────────────────────────────
  useEffect(() => {
    if (!status.connected) return;
    api.jira.boards().then((b) => setBoards(b as JiraBoard[]));
  }, [status.connected]);

  // ── load sprints when a board is selected ────────────────────────────────
  const handleBoardSelect = async (b: JiraBoard) => {
    setSelectedBoard(b);
    setSelectedSprint(null);
    setSprints([]);
    setImportResult(null);
    setSyncResult(null);
    setBoardsOpen(false);
    setLoadingSprints(true);
    const data = await api.jira.sprints(b.id);
    setSprints(data as JiraSprint[]);
    setLoadingSprints(false);
    // Auto-select the active sprint if any
    const active = (data as JiraSprint[]).find((s) => s.state === "active");
    if (active) setSelectedSprint(active);
  };

  // ── import ────────────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!selectedBoard || !selectedSprint) return;
    setImporting(true);
    setError(null);
    setImportResult(null);
    setSyncResult(null);
    try {
      const result = await api.jira.importSprint({
        board_id: selectedBoard.id,
        sprint_id: selectedSprint.id,
      });
      if (result?.detail) throw new Error(result.detail);
      setImportResult(result as ImportedSprint);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  // ── sync ──────────────────────────────────────────────────────────────────
  const handleSync = async () => {
    if (!selectedBoard || !selectedSprint) return;
    setSyncing(true);
    setError(null);
    try {
      const result = await api.jira.sync({
        board_id: selectedBoard.id,
        sprint_id: selectedSprint.id,
      });
      if (result?.detail) throw new Error(result.detail);
      setSyncResult(result as SyncResponse);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  // ── disconnect ────────────────────────────────────────────────────────────
  const handleDisconnect = async () => {
    await api.jira.disconnect();
    setStatus({ connected: false });
    setBoards([]);
    setSelectedBoard(null);
    setSprints([]);
    setSelectedSprint(null);
    setImportResult(null);
    setSyncResult(null);
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3">
          {/* Jira logo mark */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0052CC]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
              <path d="M11.53 2.006a.522.522 0 0 0-.437.247L6.862 8.669a.522.522 0 0 0 .076.658l4.665 4.354a.522.522 0 0 0 .717-.018l4.453-4.336a.522.522 0 0 0 .06-.67L12.01 2.24a.522.522 0 0 0-.48-.234zm.477 11.49-4.593 4.28a.522.522 0 0 0-.047.72l4.12 4.73a.522.522 0 0 0 .788.002l4.148-4.712a.522.522 0 0 0-.044-.725l-4.372-4.295z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Jira</h1>
            <p className="text-sm text-ink-secondary">
              Import sprints &amp; issues · Sync status changes back to GAPNITY
            </p>
          </div>
        </div>
      </header>

      {/* Connection card */}
      <div className="card p-5">
        {loadingStatus ? (
          <div className="flex items-center gap-2 text-sm text-ink-secondary">
            <Loader2 size={14} className="animate-spin" /> Checking connection…
          </div>
        ) : status.connected ? (
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald" />
              <div>
                <div className="text-sm font-medium text-ink-primary">
                  Connected to <span className="text-emerald">{status.site_name}</span>
                </div>
                {status.site_url && (
                  <a
                    href={status.site_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 flex items-center gap-1 text-xs text-ink-secondary hover:text-ink-primary"
                  >
                    {status.site_url}
                    <ExternalLink size={10} />
                  </a>
                )}
                {status.scopes && status.scopes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {status.scopes.map((s) => (
                      <span key={s} className="chip bg-bg-hover text-ink-muted">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button onClick={handleDisconnect} className="btn shrink-0 text-rose-400 border-rose-soft hover:border-rose">
              <Unplug size={13} /> Disconnect
            </button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Connect your Jira Cloud workspace</div>
              <p className="mt-1 max-w-md text-xs text-ink-secondary">
                Authorise GAPNITY via OAuth 2.0. You'll be redirected to Atlassian and back.
                Make sure <code className="text-accent">JIRA_CLIENT_ID</code> and{" "}
                <code className="text-accent">JIRA_CLIENT_SECRET</code> are set in your{" "}
                <code className="text-accent">backend/.env</code>.
              </p>
            </div>
            <a href={api.jira.authorizeUrl()} className="btn-primary shrink-0">
              <Zap size={13} /> Connect Jira
            </a>
          </div>
        )}
      </div>

      {/* Board + sprint selectors */}
      {status.connected && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Board picker */}
          <div className="card p-4">
            <div className="mb-2 text-xs font-medium text-ink-secondary uppercase tracking-wider">
              Board
            </div>
            <div className="relative">
              <button
                className="btn w-full justify-between"
                onClick={() => setBoardsOpen((o) => !o)}
                disabled={boards.length === 0}
              >
                <span className="truncate">
                  {selectedBoard ? selectedBoard.name : boards.length === 0 ? "Loading boards…" : "Select a board"}
                </span>
                <ChevronDown size={14} className="shrink-0" />
              </button>
              {boardsOpen && boards.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-border-default bg-bg-elevated shadow-card">
                  {boards.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleBoardSelect(b)}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-bg-hover first:rounded-t-xl last:rounded-b-xl"
                    >
                      <span className="truncate">{b.name}</span>
                      <span className="shrink-0 text-xs text-ink-muted">{b.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sprint picker */}
          <div className="card p-4">
            <div className="mb-2 text-xs font-medium text-ink-secondary uppercase tracking-wider">
              Sprint
            </div>
            <div className="relative">
              <button
                className="btn w-full justify-between"
                onClick={() => setSprintsOpen((o) => !o)}
                disabled={!selectedBoard || loadingSprints || sprints.length === 0}
              >
                <span className="flex items-center gap-2 truncate">
                  {loadingSprints ? (
                    <><Loader2 size={12} className="animate-spin" /> Loading…</>
                  ) : selectedSprint ? (
                    <>{selectedSprint.name} {statusChip(selectedSprint.state)}</>
                  ) : (
                    !selectedBoard ? "Select a board first" : sprints.length === 0 ? "No sprints found" : "Select a sprint"
                  )}
                </span>
                <ChevronDown size={14} className="shrink-0" />
              </button>
              {sprintsOpen && sprints.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-border-default bg-bg-elevated shadow-card">
                  {sprints.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedSprint(s); setSprintsOpen(false); setImportResult(null); setSyncResult(null); }}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-bg-hover first:rounded-t-xl last:rounded-b-xl"
                    >
                      <span className="truncate">{s.name}</span>
                      {statusChip(s.state)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action bar */}
      {status.connected && selectedBoard && selectedSprint && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleImport}
            disabled={importing}
            className="btn-primary"
          >
            {importing
              ? <><Loader2 size={13} className="animate-spin" /> Importing…</>
              : <><ArrowRight size={13} /> Import sprint</>}
          </button>
          <button
            onClick={handleSync}
            disabled={syncing || !importResult}
            className="btn"
            title={!importResult ? "Import first to establish a baseline for sync" : undefined}
          >
            {syncing
              ? <><Loader2 size={13} className="animate-spin" /> Syncing…</>
              : <><RefreshCw size={13} /> Sync statuses</>}
          </button>
          <span className="text-xs text-ink-muted">
            {selectedBoard.name} · {selectedSprint.name}
          </span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-soft bg-rose-soft/40 px-4 py-3 text-sm text-rose">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <div>
            <div className="font-medium">Something went wrong</div>
            <div className="mt-0.5 text-xs opacity-80">{error}</div>
          </div>
        </div>
      )}

      {/* Import result */}
      {importResult && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">
                {importResult.sprint.name}
                <span className="ml-2">{statusChip(importResult.sprint.state)}</span>
              </h2>
              <p className="text-xs text-ink-secondary mt-0.5">
                {importResult.imported} of {importResult.total} issues imported
                {importResult.sprint.start_date && (
                  <> · {importResult.sprint.start_date} → {importResult.sprint.end_date}</>
                )}
              </p>
            </div>
          </div>

          <IssueTable issues={importResult.issues} />
        </section>
      )}

      {/* Sync result */}
      {syncResult && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold">Sync result</h2>
            <span className="chip bg-emerald-soft text-emerald">
              {syncResult.changed} changed
            </span>
            <span className="chip bg-bg-hover text-ink-secondary">
              {syncResult.synced} synced
            </span>
          </div>
          <SyncTable issues={syncResult.issues} />
        </section>
      )}
    </div>
  );
}

// ── Issue table ───────────────────────────────────────────────────────────────

function IssueTable({ issues }: { issues: JiraIssue[] }) {
  if (issues.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-ink-secondary">
        No issues found in this sprint.
      </div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-left text-xs text-ink-muted">
            <th className="px-4 py-2.5 font-medium w-24">Key</th>
            <th className="px-4 py-2.5 font-medium">Summary</th>
            <th className="px-4 py-2.5 font-medium hidden md:table-cell">Assignee</th>
            <th className="px-4 py-2.5 font-medium hidden md:table-cell w-28">Status</th>
            <th className="px-4 py-2.5 font-medium w-16 text-right hidden lg:table-cell">Pts</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id} className="border-b border-border-subtle last:border-0 hover:bg-bg-hover/40 transition-colors">
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-1.5 font-mono text-xs text-accent">
                  {issueTypeDot(issue.issue_type)}
                  {issue.key}
                </div>
              </td>
              <td className="px-4 py-2.5 text-ink-primary max-w-xs">
                <div className="truncate">{issue.summary}</div>
                {issue.labels.length > 0 && (
                  <div className="mt-0.5 flex gap-1">
                    {issue.labels.slice(0, 3).map((l) => (
                      <span key={l} className="chip bg-bg-hover text-ink-muted">{l}</span>
                    ))}
                  </div>
                )}
              </td>
              <td className="px-4 py-2.5 text-ink-secondary hidden md:table-cell">
                {issue.assignee ?? <span className="text-ink-muted">—</span>}
              </td>
              <td className="px-4 py-2.5 hidden md:table-cell">
                <StatusPill status={issue.status} />
              </td>
              <td className="px-4 py-2.5 text-right hidden lg:table-cell">
                {storyPointsBadge(issue.story_points)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Sync table ────────────────────────────────────────────────────────────────

function SyncTable({ issues }: { issues: SyncResponse["issues"] }) {
  if (issues.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-ink-secondary">No issues to show.</div>
    );
  }
  const changed = issues.filter((i) => i.changed);
  const unchanged = issues.filter((i) => !i.changed);
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-left text-xs text-ink-muted">
            <th className="px-4 py-2.5 font-medium w-24">Key</th>
            <th className="px-4 py-2.5 font-medium">Summary</th>
            <th className="px-4 py-2.5 font-medium w-32 hidden md:table-cell">Before</th>
            <th className="px-4 py-2.5 font-medium w-32">After</th>
          </tr>
        </thead>
        <tbody>
          {[...changed, ...unchanged].map((issue) => (
            <tr
              key={issue.key}
              className={`border-b border-border-subtle last:border-0 transition-colors ${issue.changed ? "bg-emerald-soft/20 hover:bg-emerald-soft/30" : "hover:bg-bg-hover/40"}`}
            >
              <td className="px-4 py-2.5 font-mono text-xs text-accent">{issue.key}</td>
              <td className="px-4 py-2.5 text-ink-primary max-w-xs">
                <div className="truncate">{issue.summary}</div>
              </td>
              <td className="px-4 py-2.5 hidden md:table-cell">
                <StatusPill status={issue.previous_status} />
              </td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <StatusPill status={issue.current_status} />
                  {issue.changed && (
                    <CheckCircle2 size={12} className="shrink-0 text-emerald" title="Changed" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const lower = status.toLowerCase();
  let cls = "bg-bg-hover text-ink-secondary";
  if (lower.includes("done") || lower.includes("closed") || lower.includes("complete")) {
    cls = "bg-emerald-soft text-emerald";
  } else if (lower.includes("progress") || lower.includes("review") || lower.includes("active")) {
    cls = "bg-sky-soft text-sky";
  } else if (lower.includes("block") || lower.includes("impediment")) {
    cls = "bg-rose-soft text-rose";
  } else if (lower.includes("to do") || lower.includes("open") || lower.includes("backlog")) {
    cls = "bg-bg-hover text-ink-muted";
  }
  return <span className={`chip ${cls}`}>{status}</span>;
}
