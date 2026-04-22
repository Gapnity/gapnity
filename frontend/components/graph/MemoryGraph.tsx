"use client";
// Lightweight SVG graph renderer. Nodes get deterministic radial layout
// based on their id — no physics engine needed for a demo.
import type { MemoryGraph as Graph, MemoryNode } from "@/lib/types";

const colorFor = (k: MemoryNode["kind"]) => {
  switch (k) {
    case "theme":   return "#7C5CFF";
    case "issue":   return "#F87171";
    case "action":  return "#38BDF8";
    case "outcome": return "#34D399";
    case "owner":   return "#FBBF24";
    case "sprint":  return "#9CA3B4";
  }
};

function layout(nodes: MemoryNode[]) {
  // Concentric rings per kind
  const rings: Record<MemoryNode["kind"], MemoryNode[]> = {
    theme: [], issue: [], action: [], owner: [], outcome: [], sprint: [],
  };
  nodes.forEach((n) => rings[n.kind].push(n));
  const positions: Record<string, { x: number; y: number }> = {};
  const radii: Partial<Record<MemoryNode["kind"], number>> = {
    theme: 60, issue: 150, action: 240, owner: 330, outcome: 330, sprint: 330,
  };
  (Object.keys(rings) as MemoryNode["kind"][]).forEach((kind) => {
    const group = rings[kind];
    const R = radii[kind] ?? 200;
    group.forEach((n, i) => {
      const a = (i / Math.max(group.length, 1)) * Math.PI * 2;
      positions[n.id] = { x: 400 + R * Math.cos(a), y: 300 + R * Math.sin(a) };
    });
  });
  return positions;
}

export function MemoryGraphView({ graph }: { graph: Graph }) {
  const pos = layout(graph.nodes);
  return (
    <div className="card overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <div className="text-sm font-medium">Retrospective memory graph</div>
        <div className="flex items-center gap-3 text-xs text-ink-secondary">
          <Legend color="#7C5CFF" label="Theme" />
          <Legend color="#F87171" label="Issue" />
          <Legend color="#38BDF8" label="Action" />
          <Legend color="#34D399" label="Outcome" />
          <Legend color="#FBBF24" label="Owner" />
        </div>
      </div>
      <svg viewBox="0 0 800 600" className="h-[560px] w-full bg-bg-base">
        {/* edges */}
        {graph.edges.map((e, i) => {
          const a = pos[e.from], b = pos[e.to];
          if (!a || !b) return null;
          return (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="#272C3C" strokeWidth={1.2} />
          );
        })}
        {/* nodes */}
        {graph.nodes.map((n) => {
          const p = pos[n.id];
          if (!p) return null;
          return (
            <g key={n.id} transform={`translate(${p.x}, ${p.y})`}>
              <circle r={10} fill={colorFor(n.kind)} opacity={0.9} />
              <circle r={16} fill={colorFor(n.kind)} opacity={0.12} />
              <text y={26} textAnchor="middle" fill="#E8ECF5" fontSize={11}>
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
