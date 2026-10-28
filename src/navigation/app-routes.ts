import type { DashboardTab } from "@/features/dashboard/domain/dashboard";

export const APP_ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: {
    search: "/",
    products: "/?tab=products",
    analytics: "/?tab=analytics",
  } satisfies Record<DashboardTab, string>,
} as const;

export function dashboardTabFromRoute(value: string | null): DashboardTab {
  if (value === "products" || value === "analytics") return value;
  return "search";
}
