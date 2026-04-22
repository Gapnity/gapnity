"use client";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export function TrendChart({
  data, dataKey = "value", title, unit = "", rangeLabel = "Last 6 sprints", onClick, active = false,
}: {
  data: { label: string; value: number }[];
  dataKey?: string;
  title: string;
  unit?: string;
  rangeLabel?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <div
      className={[
        "card p-4",
        onClick ? "cursor-pointer transition-colors hover:border-border-default" : "",
        active ? "border-accent/60 bg-accent-soft/10" : "",
      ].join(" ").trim()}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-ink-secondary">{rangeLabel}</div>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id={`g-${title.replace(/\s+/g, "-").toLowerCase()}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor={active ? "#38BDF8" : "#7C5CFF"} stopOpacity={0.55} />
                <stop offset="100%" stopColor={active ? "#38BDF8" : "#7C5CFF"} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2230" vertical={false} />
            <XAxis dataKey="label" stroke="#5B6278" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#5B6278" fontSize={11} tickLine={false} axisLine={false}
              tickFormatter={(v) => `${v}${unit}`} />
            <Tooltip
              contentStyle={{
                background: "#141722", border: "1px solid #272C3C",
                borderRadius: 10, color: "#E8ECF5", fontSize: 12,
              }}
              formatter={(v: number) => [`${v}${unit}`, title]}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={active ? "#38BDF8" : "#7C5CFF"}
              strokeWidth={2}
              fill={`url(#g-${title.replace(/\s+/g, "-").toLowerCase()})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
