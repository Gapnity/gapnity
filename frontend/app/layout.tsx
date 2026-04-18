import "./globals.css";
import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "GAPNITY — Retrospective Intelligence",
  description:
    "Turn retrospectives into measurable improvement. Detect recurring issues, score action effectiveness, and close the loop across sprints.",
  icons: {
    icon: "/gapnity-logo.png",
    shortcut: "/gapnity-logo.png",
    apple: "/gapnity-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg-base text-ink-primary">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
