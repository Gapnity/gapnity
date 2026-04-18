// Screen 5 — Action effectiveness board.

import { api } from "@/lib/api";
import { ActionBoard } from "@/components/actions/ActionBoard";
import { MetricCard } from "@/components/dashboard/MetricCard";

export const dynamic = "force-dynamic";

export default async function ActionsPage() {
  const actions = await api.actions();
  const completionRate = Math.round(
    actions.filter((a) => ["completed", "effective"].includes(a.status)).length / actions.length * 100
  );
  const carryover = actions.filter((a) => a.status === "new" || a.status === "in_progress").length;
  const avgImpact = Math.round(
    actions.filter((a) => a.effectiveness_score != null)
           .reduce((s, a) => s + (a.effectiveness_score || 0), 0)
      / Math.max(1, actions.filter((a) => a.effectiveness_score != null).length)
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Action effectiveness</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Did the things we said we'd do actually make things better?
        </p>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Completion rate" value={`${completionRate}`} unit="%" delta={+4} tone="positive" />
        <MetricCard label="Carryover" value={carryover} unit=" actions" delta={+1} tone="warn" />
        <MetricCard label="Average impact" value={avgImpact} unit="/100" delta={+6} tone="positive"
          hint="Post-hoc score linking action to outcome metrics" />
      </section>

      <ActionBoard actions={actions} />
    </div>
  );
}
