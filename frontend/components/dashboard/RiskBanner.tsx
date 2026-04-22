"use client";
// Smart improvement #3: Predictive Risk banner.
// Surfaces AI-inferred delivery risk signals ABOVE the fold so users act
// on them before a retro even happens, instead of reading about them after.
import { AlertTriangle, ChevronRight } from "lucide-react";

export function RiskBanner({
  level, signals,
}: { level: "low" | "medium" | "high"; signals: string[] }) {
  const bg =
    level === "high" ? "border-rose/40 bg-rose-soft/40"
    : level === "medium" ? "border-amber/40 bg-amber-soft/40"
    : "border-emerald/40 bg-emerald-soft/30";
  const tone =
    level === "high" ? "text-rose" : level === "medium" ? "text-amber" : "text-emerald";

  const openInCopilot = () => {
    const prompt = `Summarize the current delivery risk, explain the top signals, and recommend the next action. Signals: ${signals.join("; ")}`;
    window.dispatchEvent(new CustomEvent("copilot:open", { detail: { question: prompt } }));
  };

  return (
    <div className={`card border ${bg} p-4`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={tone} size={18} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              Predicted delivery risk: <span className={tone}>{level.toUpperCase()}</span>
            </span>
            <span className="chip bg-bg-elevated text-ink-secondary">3 signals</span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-ink-secondary">
            {signals.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-ink-muted" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <button className="btn" onClick={openInCopilot}>
          Open in Copilot <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
