"use client";
// Smart improvement #1: persistent AI Copilot side panel.
// - Lives across every screen so users can ask a question without navigating away.
// - Toggle via ⌘⇧K or clicking "Ask Copilot" in the top bar.
// - Pre-loaded with "suggested prompts" tied to the current screen's data.
import { useEffect, useState } from "react";
import { Sparkles, SendHorizontal, X } from "lucide-react";

const suggested = [
  "Why did 2 stories spill over this sprint?",
  "Which actions improved delivery in the last quarter?",
  "Is environment instability a recurring pattern?",
  "What's the biggest risk going into Sprint 25?",
];

type Msg = { role: "user" | "assistant"; text: string };

export function CopilotPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text:
        "Hi — I've read all your sprint meetings and Jira history. Ask me anything, or try a suggestion below.",
    },
  ]);

  useEffect(() => {
    const toggle = () => setOpen((o) => !o);
    const close = () => setOpen(false);
    const openWithPrompt = (event: Event) => {
      const detail = (event as CustomEvent<{ question?: string }>).detail;
      setOpen(true);
      if (detail?.question) {
        setInput(detail.question);
      }
    };
    window.addEventListener("copilot:toggle", toggle);
    window.addEventListener("copilot:open", openWithPrompt as EventListener);
    window.addEventListener("copilot:close", close);
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("copilot:toggle", toggle);
      window.removeEventListener("copilot:open", openWithPrompt as EventListener);
      window.removeEventListener("copilot:close", close);
      window.removeEventListener("keydown", key);
    };
  }, []);

  function ask(q: string) {
    if (!q.trim()) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    // Stubbed LLM response — real implementation calls /api/copilot.
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text:
            "Looking across the last 6 sprints, I see Environment instability appears in 5 of 6. " +
            "Staging downtime consumed an estimated 14 engineering hours this sprint alone. " +
            "The action 'Stabilize staging' is open and owned by Priya, due 2026-04-22.",
        },
      ]);
    }, 550);
  }

  if (!open) return null;
  return (
    <aside
      role="dialog"
      aria-label="AI Copilot"
      className="fixed right-0 top-0 z-40 flex h-screen w-full max-w-[420px] flex-col border-l border-border-subtle bg-bg-elevated/95 backdrop-blur"
    >
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
        <Sparkles size={16} className="text-accent" />
        <div className="text-sm font-semibold">AI Copilot</div>
        <span className="chip bg-accent-soft text-accent">context: last 6 sprints</span>
        <button className="ml-auto text-ink-secondary hover:text-ink-primary"
          onClick={() => setOpen(false)} aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-accent/20 px-3 py-2 text-sm"
                : "mr-auto max-w-[90%] rounded-2xl rounded-tl-md border border-border-subtle bg-bg-card px-3 py-2 text-sm text-ink-primary"
            }
          >
            {m.text}
          </div>
        ))}

        {messages.length <= 1 && (
          <div className="mt-2 flex flex-col gap-1.5">
            {suggested.map((s) => (
              <button key={s}
                onClick={() => ask(s)}
                className="rounded-lg border border-border-subtle bg-bg-card px-3 py-2 text-left text-xs text-ink-secondary hover:border-border-strong hover:text-ink-primary"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form className="flex items-center gap-2 border-t border-border-subtle p-3"
        onSubmit={(e) => { e.preventDefault(); ask(input); }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about retros, actions, risks…"
          className="flex-1 rounded-lg border border-border-default bg-bg-base px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:border-accent focus:outline-none"
        />
        <button className="btn-primary" type="submit" aria-label="Send">
          <SendHorizontal size={14} />
        </button>
      </form>
    </aside>
  );
}
