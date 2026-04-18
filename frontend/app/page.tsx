import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Gauge,
  Infinity,
  Layers3,
  LineChart,
  Radar,
  Repeat2,
  Target,
} from "lucide-react";

const featureCards = [
  {
    icon: Repeat2,
    title: "Continuous Loop Intelligence",
    body: "Tracks patterns across sprints so recurring friction becomes visible before it becomes normal.",
  },
  {
    icon: Radar,
    title: "Gap Detection Engine",
    body: "Finds repeated blockers, contradiction signals, and blind spots across team rituals automatically.",
  },
  {
    icon: Gauge,
    title: "Action Effectiveness Tracking",
    body: "Measures which retro actions actually improve delivery, health, and execution quality over time.",
  },
  {
    icon: Bot,
    title: "AI Recommendations",
    body: "Suggests improvement experiments with context, urgency, and the likely next best move for the team.",
  },
];

const pricingTiers = [
  {
    name: "Trial",
    subtitle: "Free",
    tone: "border-border-subtle",
    badge: null,
    items: ["Limited retros analysis", "Basic insights", "1 team"],
    cta: "Start Free",
    href: "#auth",
  },
  {
    name: "Pro",
    subtitle: "Most Popular",
    tone: "border-accent shadow-glow",
    badge: "Most Popular",
    items: ["Full AI insights", "Recurring gap tracking", "Action effectiveness", "Integrations (Jira)"],
    cta: "Upgrade to Pro",
    href: "#auth",
  },
  {
    name: "Max",
    subtitle: "Enterprise",
    tone: "border-border-subtle",
    badge: null,
    items: ["Unlimited teams", "Advanced analytics", "Org-wide insights", "Priority support"],
    cta: "Contact Sales",
    href: "mailto:sales@gapnity.com",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-ink-primary">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-8rem] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.18),transparent_60%)] blur-3xl" />
        <div className="absolute right-[-10%] top-[10rem] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.18),transparent_60%)] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[40rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-6 pb-20 pt-6 md:px-8 lg:px-10">
        <nav className="sticky top-0 z-30 mb-10 flex items-center justify-between rounded-full border border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-2xl ring-1 ring-white/10">
              <Image src="/gapnity-logo.png" alt="Gapnity logo" fill sizes="40px" className="object-cover" priority />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[0.28em] text-white">GAPNITY</div>
              <div className="text-[11px] text-slate-400">Continuous improvement intelligence</div>
            </div>
          </Link>

          <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
            <a href="#about" className="transition-colors hover:text-white">About</a>
            <a href="#docs" className="transition-colors hover:text-white">Docs</a>
          </div>

          <div className="flex items-center gap-2">
            <a href="#auth" className="btn border-white/10 bg-transparent text-slate-200 hover:bg-white/5">Login</a>
            <a href="#auth" className="btn-primary">Sign Up</a>
          </div>
        </nav>

        <section className="grid items-center gap-12 pb-24 pt-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-300">
              <Infinity size={12} className="text-orange-400" />
              AI-powered feedback loop
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-white md:text-6xl">
              Close the Gaps. Improve Every Sprint.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Gapnity turns retrospective insights into measurable improvements using AI-powered analysis
              and continuous feedback loops.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/dashboard" className="btn-primary px-5 py-3 text-base">
                🚀 Get Started
              </Link>
              <a href="#product-visuals" className="btn border-white/10 bg-white/5 px-5 py-3 text-base text-white hover:bg-white/10">
                🔍 View Demo
              </a>
            </div>
            <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
              {[
                ["32%", "fewer repeated blockers"],
                ["6 sprint", "visibility window"],
                ["1 loop", "from insight to action"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-2xl font-semibold text-white">{value}</div>
                  <div className="mt-1 text-sm text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-6 rounded-[2rem] bg-[radial-gradient(circle,rgba(249,115,22,0.22),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(45,212,191,0.22),transparent_35%)] blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Gapnity loop intelligence</div>
                  <div className="text-xs text-slate-400">See the full improvement loop at a glance.</div>
                </div>
                <span className="chip bg-white/5 text-slate-300">Live signal</span>
              </div>
              <div className="relative mx-auto aspect-square max-w-[420px]">
                <div className="absolute inset-0 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_65%)]" />
                <Image
                  src="/gapnity-logo.png"
                  alt="Gapnity infinity loop"
                  fill
                  sizes="(max-width: 1024px) 80vw, 420px"
                  className="object-contain drop-shadow-[0_0_40px_rgba(249,115,22,0.24)]"
                  priority
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Repeat themes</div>
                  <div className="mt-2 text-sm text-slate-200">Environment instability, flaky automation, acceptance-criteria churn.</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Recommended next move</div>
                  <div className="mt-2 text-sm text-slate-200">Stabilize staging while preserving the faster review cadence from Sprint 24.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="why-gapnity" className="grid gap-6 border-t border-white/10 py-24 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Why Gapnity?</div>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              Retrospectives create ideas. Gapnity makes them measurable.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              Most teams already talk about what went wrong. The missing piece is a system that sees
              the patterns, tracks the follow-through, and proves whether improvement actually happened.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6">
              <div className="mb-4 inline-flex rounded-2xl bg-rose-500/10 p-3 text-rose-300"><Layers3 size={20} /></div>
              <div className="text-lg font-medium text-white">Problems</div>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>Retros are forgotten</li>
                <li>Same issues repeat</li>
                <li>No visibility into improvements</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/10 p-3 text-emerald-300"><Target size={20} /></div>
              <div className="text-lg font-medium text-white">Solution</div>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>AI-driven insights</li>
                <li>Tracks recurring gaps</li>
                <li>Measures improvement</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="features" className="py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Built for Continuous Improvement</div>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">The operating system for better retros.</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="group rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-white/20">
                  <div className="inline-flex rounded-2xl bg-white/5 p-3 text-orange-300 transition-colors group-hover:text-teal-300">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-5 text-lg font-medium text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{feature.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="product-visuals" className="py-24">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400">See Gapnity in Action</div>
              <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">A premium product story in one screen.</h2>
            </div>
            <Link href="/dashboard" className="btn border-white/10 bg-white/5 text-white hover:bg-white/10">
              Open Product Demo <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Dashboard mock</div>
                  <div className="text-xs text-slate-400">Delivery, health, and recurring gap visibility in one place.</div>
                </div>
                <span className="chip bg-emerald-500/10 text-emerald-300">Live board</span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ["78%", "Completion rate", "border-emerald-500/20"],
                  ["72", "Team health", "border-sky-500/20"],
                  ["4", "Open recurring issues", "border-orange-500/20"],
                ].map(([value, label, border]) => (
                  <div key={label} className={`rounded-2xl border ${border} bg-white/[0.03] p-4`}>
                    <div className="text-2xl font-semibold text-white">{value}</div>
                    <div className="mt-1 text-sm text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm text-white">Recurring issues graph</div>
                  <div className="text-xs text-slate-400">Last 6 sprints</div>
                </div>
                <div className="flex h-40 items-end gap-3">
                  {[4, 5, 4, 5, 6, 4].map((height, index) => (
                    <div key={index} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-2xl bg-[linear-gradient(180deg,rgba(249,115,22,0.9),rgba(45,212,191,0.55))]"
                        style={{ height: `${height * 18}px` }}
                      />
                      <span className="text-xs text-slate-500">S{19 + index}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Action tracking board</div>
                    <div className="text-xs text-slate-400">Know which experiments actually move the needle.</div>
                  </div>
                  <LineChart size={18} className="text-teal-300" />
                </div>
                <div className="space-y-3">
                  {[
                    ["New", "PO pre-read stories 48h before planning"],
                    ["In progress", "Stabilize staging seed data and health checks"],
                    ["Effective", "Pair rotation reduced review turnaround"],
                  ].map(([status, title]) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{status}</div>
                      <div className="mt-2 text-sm text-slate-200">{title}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
                <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Proof loop</div>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  {[
                    "See what was discussed across retros and standups.",
                    "Understand which gaps are truly recurring.",
                    "Measure whether the chosen fix improved the next sprint.",
                  ].map((line) => (
                    <li key={line} className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-emerald-300" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Simple, Transparent Pricing</div>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">Pick the loop that matches your growth stage.</h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div key={tier.name} className={`rounded-[2rem] border ${tier.tone} bg-white/[0.03] p-6`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xl font-semibold text-white">{tier.name}</div>
                    <div className="mt-1 text-sm text-slate-400">{tier.subtitle}</div>
                  </div>
                  {tier.badge && <span className="chip bg-accent-soft text-accent">{tier.badge}</span>}
                </div>
                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  {tier.items.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-teal-300" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href={tier.href}
                  className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    tier.name === "Pro"
                      ? "bg-accent text-white hover:bg-accent-hover"
                      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="grid gap-8 py-24 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-400">About Gapnity</div>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">Built to turn agile reflection into measurable progress.</h2>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-base leading-8 text-slate-300">
            Gapnity was built to solve a fundamental problem in Agile teams â€” retrospectives generate insights,
            but those insights rarely translate into measurable improvement. By combining AI analysis, historical
            pattern tracking, and action-effectiveness measurement, Gapnity helps teams turn every sprint into a
            smarter feedback loop.
          </div>
        </section>

        <section id="auth" className="py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Login / Signup</div>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">Simple access for fast team onboarding.</h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8">
              <div className="text-xl font-semibold text-white">Login</div>
              <div className="mt-2 text-sm text-slate-400">Jump back into your team workspace.</div>
              <form className="mt-6 space-y-4">
                <Field label="Email" placeholder="you@company.com" />
                <Field label="Password" placeholder="Enter password" type="password" />
                <div className="text-sm text-slate-400 hover:text-white">
                  <a href="#auth">Forgot password</a>
                </div>
                <Link href="/dashboard" className="btn-primary w-full justify-center py-3 text-base">
                  Login
                </Link>
              </form>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8">
              <div className="text-xl font-semibold text-white">Signup</div>
              <div className="mt-2 text-sm text-slate-400">Create your workspace and start tracking improvement.</div>
              <form className="mt-6 space-y-4">
                <Field label="Name" placeholder="Alex Rivera" />
                <Field label="Email" placeholder="alex@company.com" />
                <Field label="Password" placeholder="Create password" type="password" />
                <Field label="Company / Team name" placeholder="Platform Team" />
                <Link href="/dashboard" className="btn-primary w-full justify-center py-3 text-base">
                  Sign Up
                </Link>
              </form>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(249,115,22,0.14),rgba(15,23,42,0.92),rgba(45,212,191,0.14))] px-8 py-14 text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-300">Turn Gaps Into Growth</div>
            <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">Make every sprint smarter than the last.</h2>
            <Link href="/dashboard" className="btn-primary mt-8 px-6 py-3 text-base">
              🚀 Start Using Gapnity Today
            </Link>
          </div>
        </section>

        <footer id="docs" className="border-t border-white/10 py-10 text-sm text-slate-400">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <a href="#auth" className="hover:text-white">Privacy Policy</a>
              <a href="#auth" className="hover:text-white">Terms</a>
              <a href="mailto:hello@gapnity.com" className="hover:text-white">Contact</a>
              <a href="https://www.linkedin.com" className="hover:text-white">LinkedIn</a>
              <a href="https://x.com" className="hover:text-white">X</a>
            </div>
            <div>© 2026 Gapnity. All rights reserved.</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
      />
    </label>
  );
}
