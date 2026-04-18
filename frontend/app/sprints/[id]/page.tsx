// Sprint detail — Screen 3 in the spec + smart "sprint compare" split view.

import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, GitCompareArrows, Sparkles } from "lucide-react";
import { RetroSummaryPanel } from "@/components/sprints/RetroSummaryPanel";

export const dynamic = "force-dynamic";

export default async function SprintDetail({
  params, searchParams,
}: {
  params: { id: string };
  searchParams: { compare?: string };
}) {
  const data = await api.sprint(params.id) as any;
  const { sprint, issues, actions, comparison } = data as any;
  const compareWith = searchParams?.compare;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-ink-secondary hover:text-ink-primary">
            <ArrowLeft size={12} /> back to dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {sprint.name}
            <span className="ml-2 text-sm font-normal text-ink-secondary">
              {sprint.start_date} → {sprint.end_date}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={compareWith ? `/sprints/${params.id}` : `/sprints/${params.id}?compare=s23`}
            className="btn">
            <GitCompareArrows size={14} />
            {compareWith ? "Exit compare" : "Compare with S23"}
          </Link>
          <RetroSummaryPanel
            sprintId={params.id}
            sprintName={sprint.name}
            issues={issues}
            actions={actions}
          />
        </div>
      </div>

      {/* 2-column summary */}
      <section className="grid gap-3 md:grid-cols-2">
        <Card title="What went well" items={data.went_well} tone="positive" />
        <Card title="What didn't go well" items={data.did_not_go_well} tone="negative" />
        <Card title="Key decisions" items={data.decisions} tone="neutral" />
        <Card title="Action items" items={(actions as any[]).map((a) =>
          `${a.description}${a.owner_name ? ` — ${a.owner_name}` : ""}${a.due_date ? ` (due ${a.due_date})` : ""}`
        )} tone="neutral" />
      </section>

      {/* Evidence + comparison */}
      <section className="grid gap-3 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium">AI-inferred root causes</div>
            <div className="text-xs text-ink-secondary">confidence scored</div>
          </div>
          <ul className="space-y-2">
            {(issues as any[]).map((i) => (
              <li key={i.id} className="rounded-lg border border-border-subtle bg-bg-elevated p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">{i.description}</div>
                  <div className="flex items-center gap-2">
                    <span className={"chip " + (i.severity === "high" ? "bg-rose-soft text-rose" : "bg-amber-soft text-amber")}>
                      {i.severity}
                    </span>
                    <span className="chip bg-bg-hover text-ink-secondary">
                      conf {Math.round(i.confidence_score * 100)}%
                    </span>
                  </div>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-ink-secondary">
                  {i.evidence.map((e: string, k: number) => (
                    <li key={k} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-muted" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-4">
          <div className="mb-3 text-sm font-medium">vs {comparison.prev_sprint_name}</div>
          <CompareRow title="Recurring" items={comparison.recurring_themes} tone="warn" />
          <CompareRow title="Newly introduced" items={comparison.newly_introduced} tone="negative" />
          <CompareRow title="Improved" items={comparison.improved} tone="positive" />
          <div className="mt-3 rounded-lg bg-amber-soft/40 p-3 text-xs text-amber">
            <div className="font-medium">Contradiction detector</div>
            <ul className="mt-1 space-y-1">
              {comparison.contradictions.map((c: string) => <li key={c}>• {c}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {compareWith && (
        <div className="card border-accent/40 bg-accent-soft/40 p-4 text-sm">
          <strong>Compare mode:</strong> viewing {sprint.name} side-by-side with {compareWith.toUpperCase()}.
          In the real app this opens a split view — left pane shows {sprint.name}, right pane shows {compareWith.toUpperCase()},
          with AI-highlighted diffs in themes, actions, and KPIs.
        </div>
      )}
    </div>
  );
}

function Card({ title, items = [], tone }: { title: string; items?: string[]; tone: "positive" | "negative" | "neutral" }) {
  const ring = tone === "positive" ? "border-emerald/40"
            : tone === "negative" ? "border-rose/40"
            : "border-border-subtle";
  return (
    <div className={`card border ${ring} p-4`}>
      <div className="mb-2 text-sm font-medium">{title}</div>
      <ul className="space-y-1.5 text-sm text-ink-secondary">
        {items.map((t, i) => <li key={i} className="flex gap-2">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-muted" />{t}
        </li>)}
      </ul>
    </div>
  );
}

function CompareRow({ title, items = [], tone }: { title: string; items?: string[]; tone: "positive" | "negative" | "warn" }) {
  const c = tone === "positive" ? "bg-emerald-soft text-emerald"
          : tone === "negative" ? "bg-rose-soft text-rose"
          : "bg-amber-soft text-amber";
  return (
    <div className="mb-3">
      <div className="mb-1 text-xs uppercase text-ink-secondary">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.length === 0 && <span className="text-xs text-ink-muted">none</span>}
        {items.map((t) => <span key={t} className={"chip " + c}>{t}</span>)}
      </div>
    </div>
  );
}
