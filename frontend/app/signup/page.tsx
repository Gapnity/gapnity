"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const PLANS = [
  { id: "starter", label: "Starter", desc: "1 workspace, 5 users", price: "Free" },
  { id: "growth",  label: "Growth",  desc: "3 workspaces, 20 users", price: "$29/mo" },
  { id: "scale",   label: "Scale",   desc: "Unlimited workspaces", price: "$99/mo" },
];

export default function SignupPage() {
  const [step, setStep] = useState(1);  // 1 = account type, 2 = details, 3 = plan
  const [accountType, setAccountType] = useState<"personal" | "company">("personal");
  const [plan, setPlan] = useState("starter");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", company: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 2) {
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
    }
    setError("");
    if (step < totalSteps) { setStep(s => s + 1); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          company: form.company || null,
          plan,
          account_type: accountType,
        }),
      });
      let data: { token?: string; detail?: string; workspace_id?: string } = {};
      try { data = await res.json(); } catch { /* non-JSON body */ }
      if (!res.ok) throw new Error(data.detail || `Server error ${res.status}`);
      localStorage.setItem("gapnity_token", data.token!);
      if (data.workspace_id) localStorage.setItem("gapnity_active_workspace", data.workspace_id);
      window.location.href = "/verify-email";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
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
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  step >= s ? "bg-violet-600 text-white" : "bg-white/8 text-gray-500"
                }`}>{s}</div>
                {s < 3 && <div className={`w-8 h-px transition-all ${step > s ? "bg-violet-600" : "bg-white/10"}`} />}
              </div>
            ))}
            <span className="ml-2 text-gray-500 text-xs">
              {step === 1 ? "Account type" : step === 2 ? "Your details" : "Choose plan"}
            </span>
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-2xl font-bold text-white">
              {step === 1 ? "What best describes you?" : step === 2 ? "Create your account" : "Choose a plan"}
            </h1>
            <p className="text-gray-400 text-sm">
              {step === 1 ? "This helps us personalise your workspace" : step === 2 ? "Start improving your sprints today" : "Start free, upgrade anytime"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <div className="space-y-3">
                {([
                  { id: "personal", label: "Personal", desc: "Individual use — track your own projects and sprints", icon: "👤" },
                  { id: "company",  label: "Company",  desc: "Team use — manage multiple projects and invite teammates", icon: "🏢" },
                ] as const).map(opt => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      accountType === opt.id
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-white/10 bg-white/3 hover:border-white/20"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{opt.label}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{opt.desc}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      accountType === opt.id ? "border-violet-500" : "border-gray-600"
                    }`}>
                      {accountType === opt.id && <div className="w-2 h-2 rounded-full bg-violet-500" />}
                    </div>
                    <input type="radio" name="accountType" value={opt.id}
                      checked={accountType === opt.id}
                      onChange={() => setAccountType(opt.id)}
                      className="sr-only" />
                  </label>
                ))}
              </div>
            ) : step === 2 ? (
              <>
                <div className={`grid gap-3 ${accountType === "company" ? "grid-cols-2" : "grid-cols-1"}`}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Full name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="Ishan Gaikwad"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500 transition-all"
                    />
                  </div>
                  {accountType === "company" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Company name</label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={e => setForm({...form, company: e.target.value})}
                        placeholder="Gapnity Inc."
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {accountType === "company" ? "Work email" : "Email"}
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder={accountType === "company" ? "you@company.com" : "you@example.com"}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Password</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      placeholder="Min 8 characters"
                      required
                      minLength={8}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500 transition-all ${
                        form.confirmPassword && form.password !== form.confirmPassword
                          ? "border-red-500/50"
                          : "border-white/10"
                      }`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Confirm password</label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={e => setForm({...form, confirmPassword: e.target.value})}
                      placeholder="Repeat password"
                      required
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500 transition-all ${
                        form.confirmPassword && form.password !== form.confirmPassword
                          ? "border-red-500/50"
                          : form.confirmPassword && form.password === form.confirmPassword
                          ? "border-emerald-500/50"
                          : "border-white/10"
                      }`}
                    />
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className="text-xs text-red-400 mt-1">Passwords don&apos;t match</p>
                    )}
                    {form.confirmPassword && form.password === form.confirmPassword && (
                      <p className="text-xs text-emerald-400 mt-1">✓ Passwords match</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Step 3 — Plan */
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

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
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
              ) : step < totalSteps ? "Continue →" : "Create account"}
            </button>

            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="w-full py-3 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-white/20 hover:text-gray-300 transition-all"
              >
                ← Back
              </button>
            )}
          </form>

          {step === 2 && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-gray-600 text-xs">or</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`${API}/api/auth/google`}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </a>
                <a
                  href={`${API}/api/auth/github`}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  GitHub
                </a>
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
