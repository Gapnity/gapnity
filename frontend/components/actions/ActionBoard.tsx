"use client";
import { ActionItem, ActionStatus } from "@/lib/types";
import { CheckCircle2, Clock, XCircle, Sparkles, CircleDashed } from "lucide-react";

const COLUMNS: { id: ActionStatus; title: string; hint: string }[] = [
  { id: "new",           title: "New",           hint: "Captured from retro" },
  { id: "in_progress",   title: "In progress",   hint: "Actively being worked on" },
  { id: "completed",     title: "Completed",     hint: "Work done, effect TBD" },
  { id: "effective",     title: "Effective",     hint: "Outcome metrics improved" },
  { id: "not_effective", title: "Not effective", hint: "Didn't move the needle" },
];

const iconFor = (s: ActionStatus) =>
  s === "new" ? CircleDashed
  : s === "in_progress" ? Clock
  : s === "completed" ? CheckCircle2
  : s === "effective" ? Sparkles
  : XCircle;

export function ActionBoard({ actions }: { actions: ActionItem[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      {COLUMNS.map((col) => {
        const Icon = iconFor(col.id);
        const items = actions.filter((a) => a.status === col.id);
        return (
          <div key={col.id} className="card min-h-[360px] p-3">
            <div className="mb-2 flex items-center gap-2">
              <Icon size={14} className="text-ink-secondary" />
              <div className="text-sm font-medium">{col.title}</div>
              <span className="chip bg-bg-elevated text-ink-secondary">{items.length}</span>
            </div>
            <div className="mb-3 text-xs text-ink-muted">{col.hint}</div>
            <div className="space-y-2">
              {items.length === 0 && (
                <div className="rounded-lg border border-dashed border-border-subtle bg-bg-base/40 px-3 py-4 text-xs text-ink-muted">
                  Nothing here yet.
                </div>
              )}
              {items.map((a) => (
                <div key={a.id} className="rounded-lg border border-border-subtle bg-bg-elevated p-3">
                  <div className="text-sm">{a.description}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-ink-secondary">
                    {a.owner_name && <span className="chip bg-bg-hover">{a.owner_name}</span>}
                    {a.due_date && <span className="chip bg-bg-hover">due {a.due_date}</span>}
                    {a.effectiveness_score != null && (
                      <span className={
                        "chip " + (a.effectiveness_score >= 70 ? "bg-emerald-soft text-emerald"
                        : a.effectiveness_score >= 40 ? "bg-amber-soft text-amber"
                        : "bg-rose-soft text-rose")
                      }>
                        score {a.effectiveness_score}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
