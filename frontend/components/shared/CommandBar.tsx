"use client";
// Smart improvement #2: a Linear/Vercel-style ⌘K command palette.
// - Jump to any sprint, theme, action, or page in one keystroke.
// - Natural-language queries are handed off to the Copilot side panel.
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Sparkles } from "lucide-react";

type Cmd = { id: string; title: string; subtitle?: string; action: () => void; group: string };

export function CommandBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("cmdk:open", openHandler);
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && !e.shiftKey) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("cmdk:open", openHandler);
      window.removeEventListener("keydown", key);
    };
  }, []);

  const commands: Cmd[] = useMemo(() => [
    { id: "go-dash",     group: "Navigate", title: "Dashboard",           action: () => router.push("/dashboard") },
    { id: "go-sprint",   group: "Navigate", title: "Current sprint",      subtitle: "Sprint 24", action: () => router.push("/sprints/s24") },
    { id: "go-patterns", group: "Navigate", title: "Recurring patterns",  action: () => router.push("/patterns") },
    { id: "go-actions",  group: "Navigate", title: "Action effectiveness", action: () => router.push("/actions") },
    { id: "go-memory",   group: "Navigate", title: "Memory graph",        action: () => router.push("/memory") },
    { id: "go-upload",   group: "Navigate", title: "Upload transcript",   action: () => router.push("/upload") },
    { id: "ask",         group: "Ask AI",   title: "Ask Copilot about this…", action: () => { setOpen(false); window.dispatchEvent(new CustomEvent("copilot:toggle")); } },
    { id: "compare",     group: "Actions",  title: "Compare Sprint 24 ↔ Sprint 23", action: () => router.push("/sprints/s24?compare=s23") },
    { id: "new-exp",     group: "Actions",  title: "Create improvement experiment", action: () => alert("Opens experiment wizard (stub)") },
  ], [router]);

  const filtered = commands.filter((c) =>
    q.trim() === "" ? true : (c.title + " " + (c.subtitle || "")).toLowerCase().includes(q.toLowerCase())
  );

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-start justify-center bg-black/60 p-4 pt-24"
      onClick={() => setOpen(false)}>
      <div
        className="card w-full max-w-[640px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
          <Search size={14} className="text-ink-secondary" />
          <input
            autoFocus
            placeholder="Type a command, or ask a question…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 bg-transparent text-sm placeholder:text-ink-muted focus:outline-none"
          />
          <span className="kbd">esc</span>
        </div>
        <ul className="max-h-[360px] overflow-y-auto py-1">
          {filtered.length === 0 && (
            <li className="flex items-center gap-2 px-4 py-3 text-sm text-ink-secondary">
              <Sparkles size={14} className="text-accent" />
              Ask Copilot: "{q}"
            </li>
          )}
          {filtered.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => { c.action(); setOpen(false); }}
                className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-bg-hover"
              >
                <span>
                  <span className="text-ink-primary">{c.title}</span>
                  {c.subtitle && <span className="ml-2 text-xs text-ink-secondary">{c.subtitle}</span>}
                </span>
                <span className="flex items-center gap-2 text-xs text-ink-muted">
                  <span className="chip bg-bg-elevated text-ink-secondary">{c.group}</span>
                  <ArrowRight size={12} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
