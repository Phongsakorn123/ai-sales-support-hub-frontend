"use client";

import { useLogoutViewModel } from "@/features/auth/presentation/view-models/use-logout-view-model";

export default function LogoutButton() {
  const { logout } = useLogoutViewModel();

  return (
    <button
      className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
      onClick={logout}
      type="button"
    >
      Sign out
    </button>
  );
}
