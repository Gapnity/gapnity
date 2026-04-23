"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader } from "lucide-react";

function CallbackContent() {
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const workspaceId = params.get("workspace_id");
    const error = params.get("error");

    if (error) {
      window.location.href = `/signup?error=${encodeURIComponent(error)}`;
      return;
    }

    if (token) {
      localStorage.setItem("gapnity_token", token);
      if (workspaceId) localStorage.setItem("gapnity_active_workspace", workspaceId);
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/signup?error=Authentication+failed";
    }
  }, [params]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Loader size={32} className="text-violet-400 animate-spin" />
      <p className="text-gray-400 text-sm">Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <Loader size={32} className="text-violet-400 animate-spin" />
          <p className="text-gray-400 text-sm">Loading…</p>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
