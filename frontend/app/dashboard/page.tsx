// Product dashboard inside the authenticated app shell.

import Link from "next/link";
import { api } from "@/lib/api";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { GitCompareArrows, Upload } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Both calls hit the real backend in parallel
  const [m, themes] = await Promise.all([
    api.dashboard("platform"),
    api.themes(),
  ]);

  // Top 4 recurring themes by occurrences (live from backend)
  const topThemes = [...themes]
    .sort((a, b) => (b.occurrences ?? 0) - (a.occurrences ?? 0))
    .slice(0, 4);

  const severityLabel = (occ: number) => (occ >= 4 ? "high" : "medium");
  const sprintLabel = (occ: number) => `${occ} of last 6 sprints`;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-secondary">Platform Team</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {m.sprint_name} overview
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-secondary">
            Retrospective intelligence across the last six sprints.
            Patterns, actions and outcomes — connected.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sprints/s24?compare=s23" className="btn">
            <GitCompareArrows size={14} /> Compare with Sprint 23
          </Link>
          <Link href="/upload" className="btn-primary">
            <Upload size={14} /> Ingest transcript
          </Link>
        </div>
      </header>

      <DashboardClient metrics={m} />

      <section className="grid gap-3 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium">Top recurring issues</div>
            <Link href="/patterns" className="text-xs text-accent hover:underline">
              View all patterns →
            </Link>
          </div>
          <ul className="space-y-2">
            {topThemes.map((t) => {
              const sev = severityLabel(t.occurrences ?? 0);
              return (
                <li key={t.id} className="flex items-center justify-between rounded-lg bg-bg-elevated px-3 py-2.5">
                  <div>
                    <div className="text-sm">{t.canonical_name}</div>
                    <div className="text-xs text-ink-secondary">{sprintLabel(t.occurrences ?? 0)}</div>
                  </div>
                  <span className={"chip " + (sev === "high" ? "bg-rose-soft text-rose" : "bg-amber-soft text-amber")}>
                    {sev}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card p-4">
          <div className="mb-3 text-sm font-medium">Stakeholder pulse</div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <span>Scrum Master</span>
              <span className="chip bg-amber-soft text-amber">
                {m.delivery_risk === "high" ? "3 risks" : m.delivery_risk === "medium" ? "2 risks" : "1 risk"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span>QA Lead</span>
              <span className="chip bg-rose-soft text-rose">
                {themes.filter(t => t.canonical_name.toLowerCase().includes("flak")).length > 0 ? "flaky tests" : "stable"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span>Product Owner</span>
              <span className="chip bg-sky-soft text-sky">
                {themes.find(t => t.canonical_name.toLowerCase().includes("acceptance")) ? "AC spill" : "on track"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span>Engineering Manager</span>
              <span className={"chip " + (m.team_health >= 70 ? "bg-emerald-soft text-emerald" : "bg-amber-soft text-amber")}>
                health {m.team_health}/100
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
