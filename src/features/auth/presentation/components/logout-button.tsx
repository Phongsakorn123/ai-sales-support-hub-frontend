"use client";

import { useRouter } from "next/navigation";
import { clearAccessToken } from "@/lib/auth/session";

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout(): void {
    clearAccessToken();
    router.replace("/login");
  }

  return (
    <button
      className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
      onClick={handleLogout}
      type="button"
    >
      Sign out
    </button>
  );
}
