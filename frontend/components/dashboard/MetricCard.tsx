import clsx from "clsx";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export function MetricCard({
  label, value, unit, delta, tone = "neutral", hint, onClick, active = false,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;                               // percentage change vs previous
  tone?: "positive" | "negative" | "neutral" | "warn";
  hint?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const toneColor =
    tone === "positive" ? "text-emerald"
    : tone === "negative" ? "text-rose"
    : tone === "warn" ? "text-amber"
    : "text-ink-secondary";

  const Icon =
    delta == null ? Minus : delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;

  const clickable = Boolean(onClick);

  return (
    <div
      className={clsx(
        "card p-4",
        clickable && "card-hover cursor-pointer",
        active && "border-accent/60 bg-accent-soft/20"
      )}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-ink-secondary">{label}</span>
        {delta != null && (
          <span className={clsx("inline-flex items-center gap-0.5 text-xs font-medium", toneColor)}>
            <Icon size={12} />
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {unit && <span className="text-sm text-ink-secondary">{unit}</span>}
      </div>
      {hint && <div className="mt-1 text-xs text-ink-muted">{hint}</div>}
    </div>
  );
}
