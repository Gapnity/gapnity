// Shared TypeScript types for GAPNITY.
// These mirror the backend Pydantic schemas 1:1.

export type Severity = "low" | "medium" | "high" | "critical";
export type ActionStatus =
  | "new"
  | "in_progress"
  | "completed"
  | "effective"
  | "not_effective";

export interface Team { id: string; name: string; }
export interface Sprint {
  id: string;
  team_id: string;
  name: string;
  start_date: string;
  end_date: string;
  state: "planning" | "active" | "closed";
}
export interface Theme {
  id: string;
  canonical_name: string;
  description: string;
  occurrences: number;          // # of sprints theme appeared in
}
export interface Issue {
  id: string;
  sprint_id: string;
  theme_id: string;
  description: string;
  severity: Severity;
  confidence_score: number;     // 0..1
  evidence: string[];
}
export interface ActionItem {
  id: string;
  sprint_id: string;
  issue_id?: string;
  description: string;
  owner_name?: string;
  due_date?: string;
  status: ActionStatus;
  effectiveness_score?: number; // 0..100
}
export interface Outcome {
  id: string;
  action_id: string;
  next_sprint_id: string;
  outcome_label: "improved" | "no_change" | "regressed";
  notes?: string;
}
export interface EvidenceLink {
  id: string;
  sprint_id: string;
  source_type: "jira" | "github" | "slack" | "transcript" | "test";
  source_ref: string;
  description: string;
}
export interface SprintComparison {
  prev_sprint_name: string;
  recurring_themes: string[];
  newly_introduced: string[];
  improved: string[];
  unresolved_actions: number;
  contradictions: string[];
}
export interface DashboardMetrics {
  sprint_name: string;
  completion_rate: number;      // 0..1
  action_effectiveness: number; // 0..100
  team_health: number;          // 0..100
  improvement_score: number;    // 0..100
  delivery_risk: "low" | "medium" | "high";
  risk_signals: string[];
}
export interface MemoryNode {
  id: string;
  label: string;
  kind: "theme" | "issue" | "action" | "owner" | "outcome" | "sprint";
}
export interface MemoryEdge {
  from: string;
  to: string;
  kind: "causes" | "owns" | "addresses" | "resolves" | "belongs_to";
}
export interface MemoryGraph {
  nodes: MemoryNode[];
  edges: MemoryEdge[];
}

export interface CopilotResponse {
  answer: string;
  citations: string[];
}
