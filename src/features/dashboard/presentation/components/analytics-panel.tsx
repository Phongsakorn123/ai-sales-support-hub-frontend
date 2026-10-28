"use client";

import type { Product } from "@/features/products/domain/product";
import { MetricCard, CategoryBar } from "@/features/dashboard/presentation/components/analytics-visuals";
import { ChartIcon } from "@/features/dashboard/presentation/components/dashboard-icons";

type Props = {
  active: boolean;
  products: Product[];
  productsStatus: "loading" | "ready" | "error";
  productsError: string;
  reloadProducts: () => void;
  activeProducts: Product[];
  stockUnits: number;
  inventoryValueByCurrency: Map<string, number>;
  productCategories: [string, number][];
};

export default function AnalyticsPanel({ active, products, productsStatus, productsError, reloadProducts, activeProducts, stockUnits, inventoryValueByCurrency, productCategories }: Props) {
  return (
<section
          hidden={!active}
          aria-labelledby="analytics-title"
          className="rounded-2xl border border-white/[0.08] bg-[#0d1425] p-5 shadow-xl shadow-black/10 sm:p-7"
          id="analytics-panel"
          role="tabpanel"
          tabIndex={0}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-200">
              <ChartIcon />
            </span>
            <div>
              <h2
                className="text-base font-semibold text-slate-100"
                id="analytics-title"
              >
                Analytics Dashboard
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                An overview of product discovery and sales support activity.
              </p>
            </div>
          </div>

          {productsStatus === "loading" ? (
            <p
              className="mt-6 rounded-xl border border-white/[0.07] bg-[#080d1b]/60 p-5 text-sm text-slate-400"
              role="status"
            >
              Loading product analytics…
            </p>
          ) : productsStatus === "error" ? (
            <div
              className="mt-6 rounded-xl border border-rose-400/20 bg-rose-400/[0.05] p-5"
              role="alert"
            >
              <p className="text-sm text-rose-200">{productsError}</p>
              <button
                className="mt-3 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-200 hover:bg-white/[0.05]"
                onClick={reloadProducts}
                type="button"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MetricCard
                  label="Total products"
                  value={products.length.toLocaleString()}
                />
                <MetricCard
                  label="Active products"
                  value={activeProducts.length.toLocaleString()}
                />
                <MetricCard
                  label="Units in stock"
                  value={stockUnits.toLocaleString()}
                />
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-white/[0.07] bg-[#080d1b]/60 p-5">
                  <h3 className="text-sm font-medium text-slate-200">
                    Catalog value
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Estimated value at selling price, grouped by product
                    currency
                  </p>
                  {inventoryValueByCurrency.size ? (
                    <div className="mt-5 space-y-2">
                      {[...inventoryValueByCurrency]
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([currency, value]) => (
                          <p
                            className="text-2xl font-semibold tracking-tight text-white"
                            key={currency}
                          >
                            {new Intl.NumberFormat(undefined, {
                              style: "currency",
                              currency,
                              maximumFractionDigits: 0,
                            }).format(value)}
                          </p>
                        ))}
                    </div>
                  ) : (
                    <p className="mt-6 text-sm text-slate-500">
                      No priced products with stock available.
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    Calculated from current product prices and stock quantities
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-[#080d1b]/60 p-5">
                  <h3 className="text-sm font-medium text-slate-200">
                    Top product categories
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Share of products in each category
                  </p>
                  {productCategories.length ? (
                    <div className="mt-6 space-y-5">
                      {productCategories.map(([label, count]) => (
                        <CategoryBar
                          key={label}
                          label={label}
                          value={Math.round((count / products.length) * 100)}
                          count={count}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-6 text-sm text-slate-500">
                      No products to analyze yet.
                    </p>
                  )}
                </div>
              </div>
              <p className="mt-5 text-center text-[11px] text-slate-500">
                Based on your current product catalog. Analytics refresh when
                product data is reloaded.
              </p>
            </>
          )}
        </section>
  );
}
