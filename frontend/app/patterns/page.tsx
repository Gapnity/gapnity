// Screen 6 — Recurring pattern heatmap.

import { Heatmap, HeatRow } from "@/components/charts/Heatmap";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PatternsPage() {
  const themes = await api.themes();

  // Severity matrix over last 6 sprints (demo data — real data comes from backend).
  const columns = ["S19", "S20", "S21", "S22", "S23", "S24"];
  const matrix: Record<string, number[]> = {
    "Environment instability":  [2, 3, 1, 2, 3, 3],
    "Unclear acceptance criteria":[1, 0, 2, 1, 2, 2],
    "Flaky automation":         [0, 2, 2, 2, 3, 2],
    "External dependency delays":[0, 1, 1, 2, 1, 0],
    "Mid-sprint scope creep":   [1, 0, 0, 2, 1, 1],
    "Story carryover":          [1, 1, 0, 1, 2, 1],
  };
  const rows: HeatRow[] = themes.map((t) => ({
    theme: t.canonical_name,
    values: matrix[t.canonical_name] || [0, 0, 0, 0, 0, 0],
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Recurring patterns</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Which issues keep coming back? Hotter cells = higher severity that sprint.
        </p>
      </header>

      <Heatmap columns={columns} rows={rows} />

      <section className="card p-4">
        <div className="mb-2 text-sm font-medium">AI-suggested improvement experiments</div>
        <ul className="space-y-2 text-sm text-ink-secondary">
          <li className="rounded-lg bg-bg-elevated p-3">
            <div className="text-ink-primary">Reduce environment blockers by 50% in 2 sprints</div>
            <div className="text-xs">
              Hypothesis: pinning seed data + adding health-check retries reduces staging incidents.
              Success metric: incidents/sprint ≤ 1. Owner suggestion: Priya (SRE).
            </div>
          </li>
          <li className="rounded-lg bg-bg-elevated p-3">
            <div className="text-ink-primary">Pre-read stories 48h before planning</div>
            <div className="text-xs">
              Hypothesis: reduces AC ambiguity. Success metric: zero AC rewrites mid-sprint.
              Owner suggestion: Arjun (PO).
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
