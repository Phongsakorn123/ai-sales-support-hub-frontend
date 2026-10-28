"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DashboardTab } from "@/features/dashboard/domain/dashboard";
import {
  BoxIcon,
  ChartIcon,
  SearchIcon,
} from "@/features/dashboard/presentation/components/dashboard-icons";
import { DASHBOARD_NAVIGATION_ITEMS } from "@/features/dashboard/presentation/navigation/dashboard-navigation-items";

const icons = {
  search: SearchIcon,
  products: BoxIcon,
  analytics: ChartIcon,
};

export default function DashboardNavigation({
  activeTab,
}: {
  activeTab: DashboardTab;
}) {
  const router = useRouter();

  function navigateByArrow(index: number, direction: number): void {
    const nextIndex =
      (index + direction + DASHBOARD_NAVIGATION_ITEMS.length) %
      DASHBOARD_NAVIGATION_ITEMS.length;
    const nextItem = DASHBOARD_NAVIGATION_ITEMS[nextIndex];
    router.push(nextItem.href);
    document.getElementById(`${nextItem.id}-tab`)?.focus();
  }

  return (
    <nav
      aria-label="Dashboard sections"
      className="mb-6 grid grid-cols-1 gap-1 rounded-2xl border border-white/[0.07] bg-[#0d1425] p-1.5 sm:grid-cols-3"
      role="tablist"
    >
      {DASHBOARD_NAVIGATION_ITEMS.map((item, index) => {
        const selected = activeTab === item.id;
        const Icon = icons[item.icon];

        return (
          <Link
            aria-controls={`${item.id}-panel`}
            aria-selected={selected}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
              selected
                ? "bg-indigo-400/[0.14] text-indigo-100 ring-1 ring-inset ring-indigo-300/[0.16]"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
            }`}
            href={item.href}
            id={`${item.id}-tab`}
            key={item.id}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                navigateByArrow(index, -1);
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                navigateByArrow(index, 1);
              }
            }}
            role="tab"
            tabIndex={selected ? 0 : -1}
          >
            <Icon />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
