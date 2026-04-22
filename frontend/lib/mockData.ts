// Mock data so the UI renders without a running backend.

import type {
  DashboardMetrics, Sprint, Theme, ActionItem, MemoryGraph, Issue,
} from "./types";

export const mockDashboard: DashboardMetrics = {
  sprint_name: "Sprint 24",
  completion_rate: 0.78,
  action_effectiveness: 64,
  team_health: 72,
  improvement_score: 58,
  delivery_risk: "medium",
  risk_signals: [
    "Environment blockers reappeared in 3 standups",
    "Flaky test count up 22% vs last sprint",
    "2 stories carried over for the 3rd sprint in a row",
  ],
};

export const mockSprints: Sprint[] = [
  { id: "s24", team_id: "t1", name: "Sprint 24", start_date: "2026-04-06", end_date: "2026-04-17", state: "active" },
  { id: "s23", team_id: "t1", name: "Sprint 23", start_date: "2026-03-23", end_date: "2026-04-03", state: "closed" },
  { id: "s22", team_id: "t1", name: "Sprint 22", start_date: "2026-03-09", end_date: "2026-03-20", state: "closed" },
  { id: "s21", team_id: "t1", name: "Sprint 21", start_date: "2026-02-23", end_date: "2026-03-06", state: "closed" },
  { id: "s20", team_id: "t1", name: "Sprint 20", start_date: "2026-02-09", end_date: "2026-02-20", state: "closed" },
];

const issues: Issue[] = [
  {
    id: "i1", sprint_id: "s24", theme_id: "th-env",
    description: "Staging environment flaky; blocks QA verification",
    severity: "high", confidence_score: 0.88,
    evidence: ["Standup 04/08: 'env down ~2h'", "Standup 04/11: 'deploy failed, rolled back'"],
  },
  {
    id: "i2", sprint_id: "s24", theme_id: "th-ac",
    description: "Ambiguous acceptance criteria on checkout flow",
    severity: "medium", confidence_score: 0.74,
    evidence: ["Retro: 'PO clarified mid-sprint'", "PR #812 reopened after review"],
  },
  {
    id: "i3", sprint_id: "s24", theme_id: "th-flaky",
    description: "Regression suite flakiness on payment gateway mocks",
    severity: "high", confidence_score: 0.81,
    evidence: ["CI logs: 6 retries in 4 runs", "Slack #qa: 'same test again'"],
  },
];

export const mockActions: ActionItem[] = [
  { id: "a1", sprint_id: "s24", issue_id: "i1", description: "Stabilize staging: containerize DB seeds + add health-check retry",
    owner_name: "Priya", due_date: "2026-04-22", status: "in_progress", effectiveness_score: undefined },
  { id: "a2", sprint_id: "s24", issue_id: "i2", description: "PO pre-reads stories 48h before sprint start",
    owner_name: "Arjun", due_date: "2026-04-20", status: "new" },
  { id: "a3", sprint_id: "s23", issue_id: "i3", description: "Isolate payment-gateway tests with deterministic fixtures",
    owner_name: "Mei",   due_date: "2026-04-02", status: "completed", effectiveness_score: 78 },
  { id: "a4", sprint_id: "s22", description: "Reduce WIP limit to 4 per engineer",
    owner_name: "Ishan", due_date: "2026-03-18", status: "effective",    effectiveness_score: 84 },
  { id: "a5", sprint_id: "s22", description: "Split planning into scoping + estimation sessions",
    owner_name: "Lena",  due_date: "2026-03-19", status: "not_effective", effectiveness_score: 31 },
  { id: "a6", sprint_id: "s21", description: "Add definition-of-ready checklist to Jira template",
    owner_name: "Arjun", due_date: "2026-03-03", status: "completed", effectiveness_score: 66 },
];

export const mockThemes: Theme[] = [
  { id: "th-env",   canonical_name: "Environment instability", description: "Staging/QA environments go down or drift", occurrences: 5 },
  { id: "th-ac",    canonical_name: "Unclear acceptance criteria", description: "Stories enter sprint with ambiguity",   occurrences: 4 },
  { id: "th-flaky", canonical_name: "Flaky automation",          description: "Non-deterministic test failures",          occurrences: 4 },
  { id: "th-dep",   canonical_name: "External dependency delays", description: "Blocking work from other teams",          occurrences: 3 },
  { id: "th-scope", canonical_name: "Mid-sprint scope creep",    description: "New work added after commitment",          occurrences: 3 },
  { id: "th-carry", canonical_name: "Story carryover",           description: "Unfinished work rolled to next sprint",    occurrences: 3 },
];

export const mockSprint = {
  ...mockSprints[0],
  went_well: [
    "Team shipped checkout v2 ahead of demo",
    "Pair rotation reduced review time by ~30%",
  ],
  did_not_go_well: [
    "Staging downtime blocked QA twice",
    "Acceptance criteria rewritten mid-sprint",
    "Two stories carried over to Sprint 25",
  ],
  decisions: [
    "Adopt pre-sprint story grooming 48h before planning",
    "Pin payment gateway mock version",
  ],
  issues,
  comparison: {
    prev_sprint_name: "Sprint 23",
    recurring_themes: ["Environment instability", "Flaky automation"],
    newly_introduced: ["Ambiguous acceptance criteria (checkout)"],
    improved: ["Review turnaround time"],
    unresolved_actions: 3,
    contradictions: [
      "Planning assumed stable staging; 3 incidents occurred in execution",
    ],
  },
};

export const mockGraph: MemoryGraph = {
  nodes: [
    { id: "th-env",   label: "Environment instability", kind: "theme" },
    { id: "th-flaky", label: "Flaky automation",        kind: "theme" },
    { id: "th-ac",    label: "Unclear AC",              kind: "theme" },
    { id: "i1",       label: "Staging down (S24)",      kind: "issue" },
    { id: "i3",       label: "Payment-gateway flakiness",kind: "issue" },
    { id: "i2",       label: "Checkout AC ambiguity",   kind: "issue" },
    { id: "a1",       label: "Stabilize staging",       kind: "action" },
    { id: "a3",       label: "Deterministic fixtures",  kind: "action" },
    { id: "a2",       label: "PO pre-reads",            kind: "action" },
    { id: "o1",       label: "Flaky rate -62% (S23→S24)", kind: "outcome" },
    { id: "u-priya",  label: "Priya",                   kind: "owner" },
    { id: "u-mei",    label: "Mei",                     kind: "owner" },
    { id: "u-arjun",  label: "Arjun",                   kind: "owner" },
  ],
  edges: [
    { from: "i1", to: "th-env",   kind: "belongs_to" },
    { from: "i3", to: "th-flaky", kind: "belongs_to" },
    { from: "i2", to: "th-ac",    kind: "belongs_to" },
    { from: "a1", to: "i1",       kind: "addresses" },
    { from: "a3", to: "i3",       kind: "addresses" },
    { from: "a2", to: "i2",       kind: "addresses" },
    { from: "a3", to: "o1",       kind: "resolves" },
    { from: "u-priya", to: "a1",  kind: "owns" },
    { from: "u-mei",   to: "a3",  kind: "owns" },
    { from: "u-arjun", to: "a2",  kind: "owns" },
  ],
};
