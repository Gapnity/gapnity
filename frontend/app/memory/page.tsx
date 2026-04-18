// Screen 4 — Retrospective memory graph.

import { api } from "@/lib/api";
import { MemoryGraphView } from "@/components/graph/MemoryGraph";

export const dynamic = "force-dynamic";

export default async function MemoryPage() {
  const graph = await api.memoryGraph();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Memory graph</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-secondary">
          Every theme, issue, action, owner and outcome — connected across sprints.
          Click through a theme or issue to see which actions addressed it and what happened next.
        </p>
      </header>
      <MemoryGraphView graph={graph} />
    </div>
  );
}
