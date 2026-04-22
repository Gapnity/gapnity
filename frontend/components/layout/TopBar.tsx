"use client";
import { Search, Bell, Sparkles, Filter } from "lucide-react";
import { useEffect, useState } from "react";

export function TopBar() {
  const [mac, setMac] = useState(false);
  const [range, setRange] = useState(6);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setMac(typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  const selectRange = (nextRange: number) => {
    setRange(nextRange);
    setFilterOpen(false);
    window.dispatchEvent(new CustomEvent("dashboard:range-change", { detail: { range: nextRange } }));
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border-subtle bg-bg-base/70 px-4 backdrop-blur md:px-8">
      <div
        className="flex w-full max-w-md cursor-pointer items-center gap-2 rounded-lg border border-border-default bg-bg-elevated px-3 py-1.5 text-sm text-ink-secondary hover:border-border-strong"
        onClick={() => window.dispatchEvent(new CustomEvent("cmdk:open"))}
      >
        <Search size={14} />
        <span>Search or ask — try "which actions worked last quarter?"</span>
        <span className="ml-auto flex items-center gap-1">
          <span className="kbd">{mac ? "⌘" : "Ctrl"}</span>
          <span className="kbd">K</span>
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button className="btn" onClick={() => setFilterOpen((open) => !open)}>
            <Filter size={14} /> Last {range} sprints
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-11 w-44 rounded-2xl border border-border-default bg-bg-card p-2 shadow-card">
              {[3, 6, 12].map((option) => (
                <button
                  key={option}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                    option === range
                      ? "bg-accent-soft text-ink-primary"
                      : "text-ink-secondary hover:bg-bg-hover hover:text-ink-primary"
                  }`}
                  onClick={() => selectRange(option)}
                >
                  <span>Last {option} sprints</span>
                  {option === range && <span className="text-xs text-accent">Active</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="btn-primary"
          onClick={() => window.dispatchEvent(new CustomEvent("copilot:toggle"))}>
          <Sparkles size={14} /> Ask Copilot
        </button>
        <button className="btn px-2" aria-label="Notifications">
          <Bell size={14} />
        </button>
        <div className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-accent-gradient text-xs font-semibold">
          IG
        </div>
      </div>
    </header>
  );
}
