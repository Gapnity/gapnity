"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, ChevronRight, TrendingDown, AlertTriangle, Lightbulb, BarChart2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  { icon: <TrendingDown size={14} />, text: "Why did 2 stories spill over in Sprint 24?" },
  { icon: <AlertTriangle size={14} />, text: "What's causing the environment instability pattern?" },
  { icon: <BarChart2 size={14} />, text: "Which actions have actually improved our metrics?" },
  { icon: <Lightbulb size={14} />, text: "What should we focus on in Sprint 25?" },
  { icon: <Sparkles size={14} />, text: "Summarise our team health trend over 6 sprints" },
  { icon: <TrendingDown size={14} />, text: "Which recurring issues have we failed to resolve?" },
];

export default function InsightsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          context: { sprint_id: "s24", team_id: "platform" },
        }),
      });

      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const reply =
        data.answer ?? data.reply ?? data.message ?? data.content ??
        (typeof data === "string" ? data : "No response received.");
      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages([
        ...updated,
        {
          role: "assistant",
          content: "I couldn't reach the backend. Make sure the FastAPI server is running on port 8000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <div className="px-8 pt-7 pb-4 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles size={14} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white leading-none">AI Copilot</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Sprint 24 · Platform Team</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {isEmpty ? (
          <div className="space-y-8">
            <div className="text-center pt-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={22} className="text-indigo-400" />
              </div>
              <h2 className="text-lg font-medium text-white mb-1">Ask anything about your sprints</h2>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                I have full context on Sprint 24, the last 6 sprints, all actions, and recurring patterns.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-2xl mx-auto">
              {SUGGESTED_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => send(p.text)}
                  className="flex items-center gap-2.5 text-left px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-sm text-zinc-300 hover:text-white transition-all group"
                >
                  <span className="text-indigo-400 shrink-0">{p.icon}</span>
                  <span className="flex-1">{p.text}</span>
                  <ChevronRight size={12} className="text-zinc-600 group-hover:text-zinc-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={12} className="text-indigo-400" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={12} className="text-indigo-400 animate-pulse" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-8 pb-6 pt-3 border-t border-zinc-800 shrink-0">
        {!isEmpty && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {SUGGESTED_PROMPTS.slice(0, 3).map((p, i) => (
              <button
                key={i}
                onClick={() => send(p.text)}
                className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white transition-all"
              >
                {p.text}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-end bg-zinc-900 border border-zinc-700 focus-within:border-indigo-500 rounded-xl px-4 py-3 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about patterns, actions, or sprint health…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none resize-none leading-relaxed max-h-32"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-colors"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
        <p className="text-xs text-zinc-600 mt-2 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
