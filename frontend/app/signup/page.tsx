"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const PLANS = [
  { id: "starter", label: "Starter", desc: "1 team, 5 users", price: "Free" },
  { id: "growth",  label: "Growth",  desc: "3 teams, 20 users", price: "$29/mo" },
  { id: "scale",   label: "Scale",   desc: "Unlimited", price: "$99/mo" },
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState("starter");
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    setTimeout(() => { window.location.href = "/dashboard"; }, 900);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-transparent to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-violet-600/8 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl">
            <Image src="/gapnity-logo.png" alt="Gapnity logo" fill sizes="36px" className="object-cover" />
          </div>
          <span className="text-white font-semibold tracking-[0.28em] text-sm">GAPNITY</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            FREE TO START — NO CREDIT CARD
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight">
            Your first sprint<br />
            <span className="text-violet-400">retrospective is free.</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
            Set up in 2 minutes. Connect your first retro transcript and watch Gapnity surface what's really slowing your team down.
          </p>

          {/* Feature list */}
          <ul className="space-y-3 pt-2">
            {[
              "AI analysis of sprint transcripts",
              "Recurring pattern detection across sprints",
              "Action effectiveness tracking",
              "Memory graph — every theme, issue and fix connected",
              "AI Copilot that knows your sprint history",
            ].map(f => (
              <li key={f} className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <p className="text-gray-500 text-sm italic">"We caught a pattern in sprint 3 that had been invisible for 6 months."</p>
          <p className="text-gray-600 text-xs mt-1">— QA Lead, Platform Engineering</p>
        </div>
      </div>

      {/* Right panel — signup form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl">
              <Image src="/gapnity-logo.png" alt="Gapnity logo" fill sizes="36px" className="object-cover" />
            </div>
            <span className="text-white font-semibold tracking-[0.28em] text-sm">GAPNITY</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  step >= s ? "bg-violet-600 text-white" : "bg-white/8 text-gray-500"
                }`}>{s}</div>
                {s < 2 && <div className={`w-8 h-px transition-all ${step > s ? "bg-violet-600" : "bg-white/10"}`} />}
              </div>
            ))}
            <span className="ml-2 text-gray-500 text-xs">{step === 1 ? "Your details" : "Choose plan"}</span>
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-2xl font-bold text-white">
              {step === 1 ? "Create your account" : "Choose a plan"}
            </h1>
            <p className="text-gray-400 text-sm">
              {step === 1 ? "Start improving your sprints today" : "Start free, upgrade anytime"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Full name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="Ishan Gupta"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Company</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={e => setForm({...form, company: e.target.value})}
                      placeholder="Gapnity Inc."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Work email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="you@company.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500 transition-all"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {PLANS.map(p => (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      plan === p.id
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-white/10 bg-white/3 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        plan === p.id ? "border-violet-500" : "border-gray-600"
                      }`}>
                        {plan === p.id && <div className="w-2 h-2 rounded-full bg-violet-500" />}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{p.label}</div>
                        <div className="text-gray-500 text-xs">{p.desc}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${p.id === "starter" ? "text-emerald-400" : "text-white"}`}>
                      {p.price}
                    </div>
                    <input
                      type="radio"
                      name="plan"
                      value={p.id}
                      checked={plan === p.id}
                      onChange={() => setPlan(p.id)}
                      className="sr-only"
                    />
                  </label>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account...
                </>
              ) : step === 1 ? "Continue →" : "Create account"}
            </button>

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-white/20 hover:text-gray-300 transition-all"
              >
                ← Back
              </button>
            )}
          </form>

          {step === 1 && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-gray-600 text-xs">or</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[{ name: "Google", icon: "G" }, { name: "GitHub", icon: "GH" }].map(({ name, icon }) => (
                  <button key={name} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-all">
                    <span className="text-xs font-bold text-gray-500">{icon}</span>
                    {name}
                  </button>
                ))}
              </div>
            </>
          )}

          <p className="text-center text-gray-600 text-sm mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>

          <p className="text-center mt-4">
            <Link href="/" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
