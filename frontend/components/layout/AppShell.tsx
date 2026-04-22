"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { CopilotPanel } from "@/components/layout/CopilotPanel";
import { CommandBar } from "@/components/shared/CommandBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMarketingPage = pathname === "/" || pathname === "/login" || pathname === "/signup";

  if (isMarketingPage) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <TopBar />
          <main className="relative flex-1 overflow-x-hidden p-6 md:p-8">
            <div className="pointer-events-none absolute inset-x-0 -top-10 h-64 bg-noise" />
            <div className="relative mx-auto w-full max-w-[1400px]">{children}</div>
          </main>
        </div>
        <CopilotPanel />
      </div>
      <CommandBar />
    </>
  );
}
