"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Wire to real auth when ready — for now redirect to dashboard
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl">
            <Image src="/gapnity-logo.png" alt="Gapnity logo" fill sizes="36px" className="object-cover" />
          </div>
          <span className="text-white font-semibold tracking-[0.28em] text-sm">GAPNITY</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            AI-POWERED RETROSPECTIVES
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight">
            Turn every sprint into<br />
            <span className="text-violet-400">measurable progress.</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
            Gapnity surfaces recurring blockers, tracks what actually works, and gives your team an AI copilot that remembers everything.
          </p>

          {/* Stats */}
          <div className="flex gap-8 pt-4">
            {[["32%", "fewer repeated blockers"], ["6 sprints", "visibility window"], ["1 loop", "from insight to action"]].map(([val, label]) => (
              <div key={val}>
                <div className="text-white font-bold text-xl">{val}</div>
                <div className="text-gray-500 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <p className="text-gray-500 text-sm italic">"Finally, a retro tool that actually remembers what happened last sprint."</p>
          <p className="text-gray-600 text-xs mt-1">— Engineering Manager, Platform Team</p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl">
              <Image src="/gapnity-logo.png" alt="Gapnity logo" fill sizes="36px" className="object-cover" />
            </div>
            <span className="text-white font-semibold tracking-[0.28em] text-sm">GAPNITY</span>
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500 focus:bg-white/8 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Password</label>
                <a href="#" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Forgot password?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500 focus:bg-white/8 transition-all"
              />
            </div>

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
                  Signing in...
                </>
              ) : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-gray-600 text-xs">or continue with</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* SSO options */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Google", icon: "G" },
              { name: "GitHub", icon: "GH" },
            ].map(({ name, icon }) => (
              <button
                key={name}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <span className="text-xs font-bold text-gray-500">{icon}</span>
                {name}
              </button>
            ))}
          </div>

          <p className="text-center text-gray-600 text-sm mt-8">
            Don't have an account?{" "}
            <Link href="/signup" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign up free
            </Link>
          </p>

          <p className="text-center mt-6">
            <Link href="/" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
