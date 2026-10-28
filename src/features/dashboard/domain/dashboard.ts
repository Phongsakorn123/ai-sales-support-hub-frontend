import type { Product } from "@/features/products/domain/product";

export type DashboardTab = "search" | "products" | "analytics";
export type ConfirmAction =
  | { kind: "update" }
  | { kind: "delete"; product: Product };
