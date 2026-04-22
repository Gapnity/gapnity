"use client";
// Recurring-pattern heatmap: rows = themes, columns = sprints, cell = severity 0..3.
// Pure CSS grid — no chart lib needed.

export type HeatRow = { theme: string; values: number[] };

export function Heatmap({ columns, rows }: { columns: string[]; rows: HeatRow[] }) {
  const color = (v: number) => {
    if (v >= 3) return "bg-rose/80 text-white";
    if (v === 2) return "bg-rose/50 text-white";
    if (v === 1) return "bg-amber/40 text-ink-primary";
    return "bg-bg-hover text-ink-muted";
  };
  return (
    <div className="card overflow-x-auto p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium">Recurring pattern heatmap</div>
        <div className="flex items-center gap-2 text-xs text-ink-secondary">
          <span className="chip bg-bg-hover">0</span>
          <span className="chip bg-amber/40">1</span>
          <span className="chip bg-rose/50 text-white">2</span>
          <span className="chip bg-rose/80 text-white">3</span>
        </div>
      </div>
      <div className="min-w-[720px]">
        <div
          className="grid gap-1 text-xs"
          style={{ gridTemplateColumns: `220px repeat(${columns.length}, minmax(72px, 1fr))` }}
        >
          <div />
          {columns.map((c) => (
            <div key={c} className="px-2 py-1 text-center text-ink-secondary">{c}</div>
          ))}
          {rows.map((r) => (
            <Row key={r.theme} row={r} color={color} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ row, color }: { row: HeatRow; color: (v: number) => string }) {
  return (
    <>
      <div className="truncate px-2 py-2 text-ink-primary">{row.theme}</div>
      {row.values.map((v, i) => (
        <div
          key={i}
          title={`Severity ${v}`}
          className={`grid h-8 place-items-center rounded-md ${color(v)}`}
        >
          {v > 0 ? v : ""}
        </div>
      ))}
    </>
  );
}
