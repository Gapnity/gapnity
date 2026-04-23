"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, XCircle, Loader } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function VerifyContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    fetch(`${API}/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then(async res => {
        let data: { verified?: boolean; email?: string; detail?: string } = {};
        try { data = await res.json(); } catch { /* empty body */ }
        if (res.ok && data.verified) {
          setStatus("success");
          setMessage(data.email ?? "Your email");
          setTimeout(() => { window.location.href = "/dashboard"; }, 2500);
        } else {
          setStatus("error");
          setMessage(data.detail || "Verification failed. The link may have expired.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not connect to the server. Make sure the backend is running.");
      });
  }, [token]);

  return (
    <>
      {status === "loading" && (
        <>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-600/15">
            <Loader size={36} className="text-violet-400 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verifying your email…</h1>
          <p className="text-gray-400 text-sm">Just a moment.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600/15 border border-emerald-500/20">
            <CheckCircle size={36} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Email verified!</h1>
          <p className="text-gray-400 text-sm mb-6">
            {message} is now verified. Redirecting to your dashboard…
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            Go to dashboard →
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-600/15 border border-red-500/20">
            <XCircle size={36} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verification failed</h1>
          <p className="text-gray-400 text-sm mb-6">{message}</p>
          <Link
            href="/verify-email"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-gray-300 transition-colors hover:bg-white/8"
          >
            Request a new link →
          </Link>
        </>
      )}
    </>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
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
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
