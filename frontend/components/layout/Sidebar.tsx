"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard, GitCommitHorizontal, LineChart, KanbanSquare,
  Network, Sparkles, Upload, Plug,
} from "lucide-react";
import { WorkspaceSwitcher } from "@/components/layout/WorkspaceSwitcher";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sprints/s24", label: "Current sprint", icon: GitCommitHorizontal },
  { href: "/patterns",  label: "Patterns",  icon: LineChart },
  { href: "/actions",   label: "Actions",   icon: KanbanSquare },
  { href: "/memory",    label: "Memory graph", icon: Network },
  { href: "/insights",  label: "AI Copilot",icon: Sparkles },
  { href: "/ingest",    label: "Ingest",    icon: Upload },
  { href: "/integrations/jira", label: "Jira", icon: Plug },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-border-subtle bg-bg-elevated/60 backdrop-blur md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="relative h-8 w-8 overflow-hidden rounded-lg ring-1 ring-white/10">
          <Image
            src="/gapnity-logo.png"
            alt="Gapnity logo"
            fill
            sizes="32px"
            className="object-cover"
            priority
          />
        </div>
        <div className="text-sm font-semibold tracking-[0.2em]">
          GAPNITY
        </div>
      </div>
      {/* Workspace switcher */}
      <WorkspaceSwitcher />

      <nav className="flex-1 space-y-0.5 px-2 pt-1">
        {nav.map((item) => {
          const active =
            item.href === "/dashboard"
              ? path === "/dashboard"
              : path.startsWith(item.href.split("/s24")[0]);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent-soft text-ink-primary"
                  : "text-ink-secondary hover:bg-bg-hover hover:text-ink-primary"
              )}
            >
              <Icon size={16} className={active ? "text-accent" : ""} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 pb-5 pt-2">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span>v0.1 · MVP</span>
          <span>Dark</span>
        </div>
      </div>
    </aside>
  );
}
