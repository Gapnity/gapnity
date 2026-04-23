"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, RefreshCw } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");

  async function handleResend() {
    setResending(true);
    setError("");
    setFallbackUrl("");
    try {
      const token = localStorage.getItem("gapnity_token");
      const res = await fetch(`${API}/api/auth/resend-verification`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Extract fallback URL from error detail if SMTP failed
        const detail: string = data.detail || "Failed to resend";
        const urlMatch = detail.match(/https?:\/\/\S+/);
        if (urlMatch) {
          setFallbackUrl(urlMatch[0]);
          setError("Email delivery failed — use the link below to verify directly:");
        } else {
          setError(detail);
        }
      } else {
        setResent(true);
      }
    } catch {
      setError("Couldn't reach the server. Make sure the backend is running.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl">
            <Image src="/gapnity-logo.png" alt="Gapnity logo" fill sizes="36px" className="object-cover" />
          </div>
          <span className="text-white font-semibold tracking-[0.28em] text-sm">GAPNITY</span>
        </div>

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-600/15 border border-violet-500/20">
          <Mail size={36} className="text-violet-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Check your inbox</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          We sent a verification link to your email address. Click the link to activate your account and access your workspace.
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left mb-6 space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">What to do</p>
          {["Open the email from GAPNITY", "Click \"Verify email address\"", "You'll be redirected to your dashboard"].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-violet-400 text-xs font-bold">{i + 1}</div>
              <span className="text-sm text-gray-300">{step}</span>
            </div>
          ))}
        </div>

        {resent ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 mb-4">
            ✓ Verification email resent! Check your inbox (and spam).
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-4 text-left">
            <p>{error}</p>
            {fallbackUrl && (
              <a
                href={fallbackUrl}
                className="mt-2 block break-all text-xs text-violet-400 underline hover:text-violet-300"
              >
                {fallbackUrl}
              </a>
            )}
          </div>
        ) : null}

        <button
          onClick={handleResend}
          disabled={resending || resent}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-gray-300 transition-colors hover:bg-white/8 disabled:opacity-50"
        >
          <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
          {resending ? "Resending…" : "Resend verification email"}
        </button>

        <p className="mt-6 text-center">
          <Link href="/login" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
