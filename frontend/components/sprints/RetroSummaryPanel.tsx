"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import type { CopilotResponse } from "@/lib/types";

type Props = {
  sprintId: string;
  sprintName: string;
  issues: Array<{ description: string }>;
  actions: Array<{ description: string; owner_name?: string | null }>;
};

export function RetroSummaryPanel({ sprintId, sprintName, issues, actions }: Props) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CopilotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);

    try {
      const topIssues = issues.slice(0, 3).map((issue) => issue.description).join("; ");
      const topActions = actions
        .slice(0, 2)
        .map((action) => `${action.description}${action.owner_name ? ` (owner: ${action.owner_name})` : ""}`)
        .join("; ");

      const response = await api.askCopilot({
        question: `Generate a concise retro summary for ${sprintName} (${sprintId}). Include what improved, the main blockers, and the most important next action. Issues: ${topIssues}. Actions: ${topActions}.`,
        context: "last_6_sprints",
      });

      setResult(response);
    } catch {
      setError("The retro summary could not be generated right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="btn-primary" onClick={generate} disabled={busy}>
        <Sparkles size={14} /> {busy ? "Generatingâ€¦" : "Generate retro summary"}
      </button>

      {(result || error) && (
        <section className="card border-accent/30 bg-accent-soft/10 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles size={14} className="text-accent" />
            AI retro summary
          </div>
          {error && <p className="mt-3 text-sm text-rose">{error}</p>}
          {result && (
            <>
              <p className="mt-3 text-sm leading-6 text-ink-primary">{result.answer}</p>
              {result.citations?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {result.citations.map((citation) => (
                    <span key={citation} className="chip bg-bg-hover text-ink-secondary">
                      {citation}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}
    </>
  );
}
