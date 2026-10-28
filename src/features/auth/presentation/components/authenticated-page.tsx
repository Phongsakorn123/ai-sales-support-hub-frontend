"use client";

import type { ReactNode } from "react";
import { useAuthenticatedPageViewModel } from "@/features/auth/presentation/view-models/use-authenticated-page-view-model";

export default function AuthenticatedPage({ children }: { children: ReactNode }) {
  const { isVerified, error, retry } = useAuthenticatedPageViewModel();

  if (isVerified) return children;
  if (!error) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080d1b] px-6 text-center font-sans text-slate-100">
      <div className="max-w-md">
        <p className="text-sm text-slate-300" role="alert">{error}</p>
        <button
          className="mt-4 rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-100 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          onClick={retry}
          type="button"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
