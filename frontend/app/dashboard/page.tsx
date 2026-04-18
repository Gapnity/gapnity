// Product dashboard inside the authenticated app shell.

import Link from "next/link";
import { api } from "@/lib/api";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { GitCompareArrows, Upload } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const m = await api.dashboard();

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
            Patterns, actions and outcomes â€” connected.
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
              View all patterns â†’
            </Link>
          </div>
          <ul className="space-y-2">
            {[
              ["Environment instability", "5 of last 6 sprints", "high"],
              ["Flaky automation", "4 of last 6 sprints", "high"],
              ["Unclear acceptance criteria", "4 of last 6 sprints", "medium"],
              ["External dependency delays", "3 of last 6 sprints", "medium"],
            ].map(([t, s, sev]) => (
              <li key={t as string} className="flex items-center justify-between rounded-lg bg-bg-elevated px-3 py-2.5">
                <div>
                  <div className="text-sm">{t}</div>
                  <div className="text-xs text-ink-secondary">{s}</div>
                </div>
                <span className={"chip " + (sev === "high" ? "bg-rose-soft text-rose" : "bg-amber-soft text-amber")}>
                  {sev}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-4">
          <div className="mb-3 text-sm font-medium">Stakeholder pulse</div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <span>Scrum Master</span>
              <span className="chip bg-amber-soft text-amber">2 risks</span>
            </li>
            <li className="flex items-center justify-between">
              <span>QA Lead</span>
              <span className="chip bg-rose-soft text-rose">3 flaky</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Product Owner</span>
              <span className="chip bg-sky-soft text-sky">AC spill</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Engineering Manager</span>
              <span className="chip bg-emerald-soft text-emerald">health â†‘</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
