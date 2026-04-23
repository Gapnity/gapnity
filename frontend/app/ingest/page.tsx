"use client";
import { useState, useRef } from "react";
import { Upload, FileText, Sparkles, AlertCircle, ChevronDown, CheckCircle, Zap } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type MeetingType = "retro" | "standup" | "planning" | "review" | "grooming";
type Severity = "low" | "medium" | "high" | "critical";

interface Issue {
  description: string;
  severity: Severity;
  confidence_score: number;
  evidence: string[];
}

interface ActionItem {
  description: string;
  owner_name?: string;
  due_date?: string;
}

interface AnalysisResult {
  summary: {
    went_well: string[];
    did_not_go_well: string[];
    decisions: string[];
    risks: string[];
    open_questions: string[];
  };
  themes: string[];
  issues: Issue[];
  actions: ActionItem[];
}

const MEETING_TYPES: { id: MeetingType; label: string; desc: string }[] = [
  { id: "retro",    label: "Retrospective", desc: "Sprint retro — what went well, blockers, actions" },
  { id: "standup",  label: "Standup",       desc: "Daily sync — progress, blockers, plans" },
  { id: "planning", label: "Planning",      desc: "Sprint planning — stories, estimates, goals" },
  { id: "review",   label: "Sprint Review", desc: "Demo & stakeholder feedback" },
  { id: "grooming", label: "Grooming",      desc: "Backlog refinement session" },
];

const SEVERITY_COLORS: Record<Severity, string> = {
  low:      "bg-slate-500/20 text-slate-300 border-slate-500/30",
  medium:   "bg-amber-500/20 text-amber-300 border-amber-500/30",
  high:     "bg-orange-500/20 text-orange-300 border-orange-500/30",
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
};

export default function IngestPage() {
  const [sprintName, setSprintName] = useState("");
  const [meetingType, setMeetingType] = useState<MeetingType>("retro");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function loadFile(file: File) {
    if (!file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
      setError("Only .txt and .md files are supported. For PDFs or Word docs, paste the text directly.");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => setTranscript(e.target?.result as string || "");
    reader.readAsText(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!transcript.trim()) { setError("Please paste or upload a transcript."); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const sprintId = sprintName.trim()
        ? sprintName.trim().toLowerCase().replace(/\s+/g, "-")
        : `sprint-${Date.now()}`;

      const res = await fetch(`${API}/api/meetings/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("gapnity_token") || ""}`,
        },
        body: JSON.stringify({ sprint_id: sprintId, meeting_type: meetingType, transcript }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `Analysis failed (${res.status})`);
      setResult(data);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Ingest transcript</h1>
        <p className="mt-1 text-sm text-gray-400">
          Paste or upload a meeting transcript and let AI extract themes, blockers, and action items.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sprint name + meeting type */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
              Sprint name <span className="text-gray-600 normal-case">(optional)</span>
            </label>
            <input
              value={sprintName}
              onChange={e => setSprintName(e.target.value)}
              placeholder="e.g. Sprint 14"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">Meeting type</label>
            <div className="relative">
              <select
                value={meetingType}
                onChange={e => setMeetingType(e.target.value as MeetingType)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-9 text-sm text-white focus:border-violet-500 focus:outline-none transition-colors"
              >
                {MEETING_TYPES.map(t => (
                  <option key={t.id} value={t.id} className="bg-[#0a0a0f]">{t.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-gray-400" />
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {MEETING_TYPES.find(t => t.id === meetingType)?.desc}
            </p>
          </div>
        </div>

        {/* Transcript input */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-400">Transcript</label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              <Upload size={12} /> Upload .txt file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); }}
            />
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`relative rounded-xl border transition-colors ${
              dragOver
                ? "border-violet-500 bg-violet-500/5"
                : "border-white/10 bg-white/5"
            }`}
          >
            {!transcript && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-30">
                <FileText size={32} className="text-gray-400" />
                <p className="text-sm text-gray-400">Paste transcript here or drag & drop a .txt file</p>
              </div>
            )}
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              rows={14}
              className="w-full resize-y rounded-xl bg-transparent px-4 py-3 text-sm text-white placeholder-transparent focus:outline-none font-mono leading-relaxed"
              placeholder="Paste transcript here…"
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-600">
            {transcript.length > 0 ? `${transcript.split(/\s+/).filter(Boolean).length} words` : "No transcript loaded"}
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !transcript.trim()}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Analysing transcript…
            </>
          ) : (
            <>
              <Sparkles size={15} /> Analyse transcript
            </>
          )}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-6 border-t border-white/8 pt-8">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-violet-400" />
            <h2 className="text-lg font-semibold text-white">Analysis results</h2>
            {sprintName && <span className="text-sm text-gray-400">— {sprintName}</span>}
          </div>

          {/* Themes */}
          {result.themes.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Themes detected</h3>
              <div className="flex flex-wrap gap-2">
                {result.themes.map((t, i) => (
                  <span key={i} className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Summary grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {result.summary.went_well.length > 0 && (
              <div className="card p-5">
                <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  <CheckCircle size={12} /> What went well
                </h3>
                <ul className="space-y-1.5">
                  {result.summary.went_well.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-emerald-500 shrink-0 mt-0.5">•</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.summary.did_not_go_well.length > 0 && (
              <div className="card p-5">
                <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-red-400">
                  <AlertCircle size={12} /> Didn&apos;t go well
                </h3>
                <ul className="space-y-1.5">
                  {result.summary.did_not_go_well.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-red-500 shrink-0 mt-0.5">•</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.summary.decisions.length > 0 && (
              <div className="card p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-400">Decisions made</h3>
                <ul className="space-y-1.5">
                  {result.summary.decisions.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-blue-500 shrink-0 mt-0.5">•</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.summary.risks.length > 0 && (
              <div className="card p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-400">Risks</h3>
                <ul className="space-y-1.5">
                  {result.summary.risks.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-amber-500 shrink-0 mt-0.5">•</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Issues / blockers */}
          {result.issues.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Blockers & issues ({result.issues.length})
              </h3>
              <div className="space-y-3">
                {result.issues.map((issue, i) => (
                  <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm text-gray-200">{issue.description}</p>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${SEVERITY_COLORS[issue.severity] || SEVERITY_COLORS.medium}`}>
                        {issue.severity}
                      </span>
                    </div>
                    {issue.evidence?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {issue.evidence.slice(0, 2).map((ev, j) => (
                          <p key={j} className="text-xs text-gray-500 italic">&ldquo;{ev}&rdquo;</p>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="h-1 flex-1 rounded-full bg-white/8">
                        <div
                          className="h-1 rounded-full bg-violet-500"
                          style={{ width: `${Math.round(issue.confidence_score * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{Math.round(issue.confidence_score * 100)}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action items */}
          {result.actions.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Action items ({result.actions.length})
              </h3>
              <div className="space-y-2">
                {result.actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs text-gray-500">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200">{action.description}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {action.owner_name && <span>👤 {action.owner_name}</span>}
                        {action.due_date && <span>📅 {action.due_date}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.summary.open_questions.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Open questions</h3>
              <ul className="space-y-1.5">
                {result.summary.open_questions.map((q, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-gray-500 shrink-0 mt-0.5">?</span>{q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
