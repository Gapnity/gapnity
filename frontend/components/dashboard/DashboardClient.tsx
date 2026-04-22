"use client";

import { useEffect, useState } from "react";
import type { DashboardMetrics } from "@/lib/types";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RiskBanner } from "@/components/dashboard/RiskBanner";
import { TrendChart } from "@/components/charts/TrendChart";

type FocusKey = "completion" | "health" | "recurring";

type TrendPoint = {
  label: string;
  value: number;
  note: string;
};

const completionTrend: TrendPoint[] = [
  { label: "S13", value: 52, note: "Carryover dropped after backlog cleanup." },
  { label: "S14", value: 55, note: "Planning stabilized scope for checkout work." },
  { label: "S15", value: 58, note: "Review turnaround improved with pairing." },
  { label: "S16", value: 60, note: "Fewer blocked stories reached QA." },
  { label: "S17", value: 63, note: "Cross-team dependencies landed earlier." },
  { label: "S18", value: 59, note: "Late changes created spillover risk." },
  { label: "S19", value: 61, note: "Regression triage kept most work on track." },
  { label: "S20", value: 64, note: "Definition of ready improved story quality." },
  { label: "S21", value: 70, note: "Acceptance criteria were clearer at kickoff." },
  { label: "S22", value: 74, note: "Automation stabilized for most of the sprint." },
  { label: "S23", value: 71, note: "Staging incidents slowed final validation." },
  { label: "S24", value: 78, note: "Checkout v2 shipped ahead of demo." },
];

const healthTrend: TrendPoint[] = [
  { label: "S13", value: 54, note: "Team morale recovered after release crunch." },
  { label: "S14", value: 57, note: "Fewer after-hours fixes improved focus." },
  { label: "S15", value: 60, note: "Better rotation spread support load." },
  { label: "S16", value: 62, note: "Planning clarity reduced context switching." },
  { label: "S17", value: 65, note: "Faster reviews lowered frustration." },
  { label: "S18", value: 63, note: "Environment drift created avoidable stress." },
  { label: "S19", value: 61, note: "Repeated incidents hurt confidence." },
  { label: "S20", value: 66, note: "Retros led to clearer ownership." },
  { label: "S21", value: 70, note: "Less churn improved focus time." },
  { label: "S22", value: 73, note: "Stable sprint scope boosted predictability." },
  { label: "S23", value: 68, note: "Flaky automation pulled people into firefighting." },
  { label: "S24", value: 72, note: "Pair rotation improved support coverage." },
];

const recurringTrend: TrendPoint[] = [
  { label: "S13", value: 7, note: "Multiple recurring blockers were still open." },
  { label: "S14", value: 7, note: "Theme clustering found little improvement." },
  { label: "S15", value: 6, note: "One recurring dependency issue was resolved." },
  { label: "S16", value: 6, note: "Flaky tests remained a persistent drag." },
  { label: "S17", value: 5, note: "Environment reliability showed slight gains." },
  { label: "S18", value: 5, note: "New blockers appeared but old ones closed." },
  { label: "S19", value: 4, note: "Action follow-through reduced repeat issues." },
  { label: "S20", value: 5, note: "Automation regressions reopened a known theme." },
  { label: "S21", value: 4, note: "Scope clarity kept repeat defects down." },
  { label: "S22", value: 5, note: "Dependency delays reappeared across squads." },
  { label: "S23", value: 6, note: "Environment instability and flakiness both spiked." },
  { label: "S24", value: 4, note: "Two recurring themes remain open after mitigation." },
];

const rangeOptions = [3, 6, 12];

const focusContent: Record<FocusKey, { title: string; unit: string; description: string }> = {
  completion: {
    title: "Completion",
    unit: "%",
    description: "Delivered scope by sprint, with the latest trend explaining what changed.",
  },
  health: {
    title: "Team health",
    unit: "/100",
    description: "A sprint-level health signal combining morale, focus, and delivery stability.",
  },
  recurring: {
    title: "Open recurring issues",
    unit: "",
    description: "Persistent issues that remain active after retrospectives and follow-up actions.",
  },
};

export function DashboardClient({ metrics }: { metrics: DashboardMetrics }) {
  const [range, setRange] = useState(6);
  const [focus, setFocus] = useState<FocusKey>("completion");

  useEffect(() => {
    const onRangeChange = (event: Event) => {
      const detail = (event as CustomEvent<{ range?: number }>).detail;
      if (detail?.range && rangeOptions.includes(detail.range)) {
        setRange(detail.range);
      }
    };

    window.addEventListener("dashboard:range-change", onRangeChange as EventListener);
    return () => window.removeEventListener("dashboard:range-change", onRangeChange as EventListener);
  }, []);

  const visibleCompletion = completionTrend.slice(-range);
  const visibleHealth = healthTrend.slice(-range);
  const visibleRecurring = recurringTrend.slice(-range);

  const focusedSeries =
    focus === "completion" ? visibleCompletion : focus === "health" ? visibleHealth : visibleRecurring;
  const latestPoint = focusedSeries[focusedSeries.length - 1];
  const previousPoint = focusedSeries[focusedSeries.length - 2];
  const change = previousPoint ? latestPoint.value - previousPoint.value : 0;

  const recurringLatest = visibleRecurring[visibleRecurring.length - 1]?.value ?? 0;
  const recurringDeltaBase = visibleRecurring[visibleRecurring.length - 2]?.value ?? recurringLatest;

  return (
    <div className="space-y-6">
      <RiskBanner level={metrics.delivery_risk} signals={metrics.risk_signals} />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          label="Completion rate"
          value={visibleCompletion[visibleCompletion.length - 1]?.value ?? 0}
          unit="%"
          delta={4}
          tone="positive"
          active={focus === "completion"}
          onClick={() => setFocus("completion")}
        />
        <MetricCard
          label="Action effectiveness"
          value={metrics.action_effectiveness}
          unit="/100"
          delta={-3}
          tone="warn"
          hint="Actions completed AND linked to an outcome improvement"
        />
        <MetricCard
          label="Team health"
          value={visibleHealth[visibleHealth.length - 1]?.value ?? 0}
          unit="/100"
          delta={6}
          tone="positive"
          active={focus === "health"}
          onClick={() => setFocus("health")}
        />
        <MetricCard
          label="Improvement score"
          value={metrics.improvement_score}
          unit="/100"
          delta={-2}
          tone="warn"
          hint="Recurring issues down, but action follow-through slipped"
        />
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <TrendChart
          title="Completion rate"
          data={visibleCompletion}
          unit="%"
          rangeLabel={`Last ${range} sprints`}
          active={focus === "completion"}
          onClick={() => setFocus("completion")}
        />
        <TrendChart
          title="Team health"
          data={visibleHealth}
          rangeLabel={`Last ${range} sprints`}
          active={focus === "health"}
          onClick={() => setFocus("health")}
        />
        <TrendChart
          title="Open recurring issues"
          data={visibleRecurring}
          rangeLabel={`Last ${range} sprints`}
          active={focus === "recurring"}
          onClick={() => setFocus("recurring")}
        />
      </section>

      <section className="card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-secondary">
              {focusContent[focus].title} detail
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              {latestPoint?.value}
              <span className="ml-1 text-sm font-normal text-ink-secondary">{focusContent[focus].unit}</span>
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-secondary">
              {focusContent[focus].description}
            </p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-bg-elevated px-4 py-3 text-sm">
            <div className="text-xs uppercase tracking-wide text-ink-secondary">Latest change</div>
            <div className="mt-1 font-medium text-ink-primary">
              {change > 0 ? "+" : ""}
              {change}
              {focus === "completion" ? "%" : focus === "health" ? "/100" : ""}
              {" "}
              vs previous sprint
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated/70 p-3">
            <div className="mb-2 text-sm font-medium">Sprint-by-sprint data</div>
            <ul className="space-y-2">
              {focusedSeries.map((point) => (
                <li
                  key={point.label}
                  className="flex items-start justify-between gap-3 rounded-xl border border-transparent bg-bg-base/60 px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium">{point.label}</div>
                    <div className="text-xs text-ink-secondary">{point.note}</div>
                  </div>
                  <div className="text-sm font-semibold text-ink-primary">
                    {point.value}
                    {focus === "completion" ? "%" : focus === "health" ? "/100" : ""}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-bg-elevated/70 p-3">
            <div className="mb-2 text-sm font-medium">What this means</div>
            <ul className="space-y-2 text-sm text-ink-secondary">
              {focus === "completion" && (
                <>
                  <li>Latest sprint closed strongly because review turnaround improved late in the cycle.</li>
                  <li>Range changes let you compare the short-term trend against the full 12-sprint baseline.</li>
                  <li>Use this view to spot whether higher completion came from better planning or lower scope.</li>
                </>
              )}
              {focus === "health" && (
                <>
                  <li>Team health rose again after support load was spread more evenly through pair rotation.</li>
                  <li>The dip in S23 lines up with the staging and automation incidents called out elsewhere.</li>
                  <li>This is useful for checking whether operational friction is affecting morale and focus.</li>
                </>
              )}
              {focus === "recurring" && (
                <>
                  <li>{recurringLatest} recurring issues are still open in the latest sprint window.</li>
                  <li>
                    {recurringLatest - recurringDeltaBase > 0 ? "More" : recurringLatest - recurringDeltaBase < 0 ? "Fewer" : "The same number of"} recurring issues remain compared with the prior sprint.
                  </li>
                  <li>Clicking this card keeps the historical issue count visible while you review mitigation progress.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
