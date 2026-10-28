import { APP_ROUTES } from "@/navigation/app-routes";
import type { DashboardTab } from "@/features/dashboard/domain/dashboard";

export const DASHBOARD_NAVIGATION_ITEMS: {
  id: DashboardTab;
  label: string;
  href: string;
  icon: "search" | "products" | "analytics";
}[] = [
  {
    id: "search",
    label: "Product Search",
    href: APP_ROUTES.dashboard.search,
    icon: "search",
  },
  {
    id: "products",
    label: "Manage Products",
    href: APP_ROUTES.dashboard.products,
    icon: "products",
  },
  {
    id: "analytics",
    label: "Analytics Dashboard",
    href: APP_ROUTES.dashboard.analytics,
    icon: "analytics",
  },
];
