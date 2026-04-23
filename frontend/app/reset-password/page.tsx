"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { KeyRound, CheckCircle, XCircle, Loader } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function ResetPasswordContent() {
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-600/15 border border-red-500/20">
          <XCircle size={36} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Invalid link</h1>
        <p className="text-gray-400 text-sm mb-6">This reset link is missing a token. Please request a new one.</p>
        <Link href="/forgot-password" className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-500">
          Request new link →
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Reset failed");
      setDone(true);
      setTimeout(() => { window.location.href = "/login"; }, 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600/15 border border-emerald-500/20">
          <CheckCircle size={36} className="text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Password reset!</h1>
        <p className="text-gray-400 text-sm mb-6">Your password has been updated. Redirecting to sign in…</p>
        <Link href="/login" className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-500">
          Sign in →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-600/15 border border-violet-500/20">
        <KeyRound size={36} className="text-violet-400" />
      </div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Set a new password</h1>
        <p className="text-gray-400 text-sm">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">New password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            required
            minLength={8}
            className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500 transition-all ${
              confirm && password !== confirm ? "border-red-500/50" : "border-white/10"
            }`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Confirm new password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat password"
            required
            className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500 transition-all ${
              confirm && password !== confirm
                ? "border-red-500/50"
                : confirm && password === confirm
                ? "border-emerald-500/50"
                : "border-white/10"
            }`}
          />
          {confirm && password !== confirm && <p className="text-xs text-red-400">Passwords don&apos;t match</p>}
          {confirm && password === confirm && <p className="text-xs text-emerald-400">✓ Passwords match</p>}
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Resetting…
            </>
          ) : "Reset password"}
        </button>
      </form>

      <p className="text-center mt-6">
        <Link href="/login" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
          ← Back to sign in
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl">
            <Image src="/gapnity-logo.png" alt="Gapnity logo" fill sizes="36px" className="object-cover" />
          </div>
          <span className="text-white font-semibold tracking-[0.28em] text-sm">GAPNITY</span>
        </div>
        <Suspense fallback={
          <div className="flex flex-col items-center gap-4">
            <Loader size={32} className="text-violet-400 animate-spin" />
            <p className="text-gray-400 text-sm">Loading…</p>
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
