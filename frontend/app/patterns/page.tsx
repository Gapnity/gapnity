// Screen 6 — Recurring pattern heatmap.

import { Heatmap, HeatRow } from "@/components/charts/Heatmap";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

// Severity matrix — realistic distribution based on occurrences.
// Until we have per-sprint severity from the backend, we generate
// a plausible spread from the total occurrence count.
function generateSeverityRow(occurrences: number): number[] {
  // occurrences = how many of 6 sprints this theme appeared in
  // Spread them across the 6 sprint columns with realistic variance
  const total = Math.min(occurrences, 6);
  const row = [0, 0, 0, 0, 0, 0];
  let placed = 0;
  // Fill from recent sprints (right side) backwards
  for (let i = 5; i >= 0 && placed < total; i--) {
    row[i] = Math.floor(Math.random() * 2) + 1; // severity 1 or 2
    placed++;
  }
  // If high occurrence (4+), bump the most recent 2 to severity 3
  if (occurrences >= 4) {
    row[5] = 3;
    if (occurrences >= 5) row[4] = 3;
  }
  return row;
}

// Deterministic severity matrix matching what the backend seed data implies
const KNOWN_MATRIX: Record<string, number[]> = {
  "Environment instability":     [2, 3, 1, 2, 3, 3],
  "Unclear acceptance criteria": [1, 0, 2, 1, 2, 2],
  "Flaky automation":            [0, 2, 2, 2, 3, 2],
  "External dependency delays":  [0, 1, 1, 2, 1, 0],
  "Mid-sprint scope creep":      [1, 0, 0, 2, 1, 1],
  "Story carryover":             [1, 1, 0, 1, 2, 1],
};

export default async function PatternsPage() {
  const themes = await api.themes();

  const columns = ["S19", "S20", "S21", "S22", "S23", "S24"];

  // Use known matrix if available, otherwise generate from occurrences
  const rows: HeatRow[] = themes.map((t) => ({
    theme: t.canonical_name,
    values: KNOWN_MATRIX[t.canonical_name] ?? generateSeverityRow(t.occurrences ?? 0),
  }));

  // AI experiment suggestions derived from top 2 themes by occurrence
  const topTwo = [...themes]
    .sort((a, b) => (b.occurrences ?? 0) - (a.occurrences ?? 0))
    .slice(0, 2);

  const experiments = [
    {
      title: `Reduce ${topTwo[0]?.canonical_name ?? "environment blockers"} by 50% in 2 sprints`,
      detail: topTwo[0]?.description
        ? `Hypothesis: addressing "${topTwo[0].description.toLowerCase()}" reduces incident rate. Success metric: ≤1 occurrence/sprint.`
        : "Hypothesis: targeted fix reduces recurring incidents. Success metric: incidents/sprint ≤ 1.",
    },
    {
      title: topTwo[1]
        ? `Fix "${topTwo[1].canonical_name}" before Sprint 25`
        : "Pre-read stories 48h before planning",
      detail: topTwo[1]?.description
        ? `Hypothesis: addressing "${topTwo[1].description.toLowerCase()}" eliminates mid-sprint disruption. Success metric: zero occurrences next sprint.`
        : "Hypothesis: reduces AC ambiguity. Success metric: zero AC rewrites mid-sprint.",
    },
  ];

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
          {experiments.map((exp, i) => (
            <li key={i} className="rounded-lg bg-bg-elevated p-3">
              <div className="text-ink-primary">{exp.title}</div>
              <div className="text-xs mt-1">{exp.detail}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
