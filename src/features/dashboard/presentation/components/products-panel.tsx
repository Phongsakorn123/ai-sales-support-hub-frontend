"use client";

import type { Dispatch, SetStateAction } from "react";
import type { Product } from "@/features/products/domain/product";
import type { ConfirmAction } from "@/features/dashboard/domain/dashboard";
import { ProductThumb } from "@/features/dashboard/presentation/components/product-visual";
import { SearchIcon, BoxIcon, FilterIcon, PlusIcon, EditIcon, TrashIcon } from "@/features/dashboard/presentation/components/dashboard-icons";

type Props = {
  active: boolean;
  products: Product[];
  productsStatus: "loading" | "ready" | "error";
  productsError: string;
  visibleProducts: Product[];
  groupedProducts: Map<string, Product[]>;
  categoryOptions: string[];
  activeCategoryFilter: string;
  setCategoryFilter: (value: string) => void;
  productQuery: string;
  setProductQuery: (value: string) => void;
  openProductDialog: (product?: Product) => void;
  deletingProductId: number | null;
  setDetailProductId: (value: number | null) => void;
  setConfirmAction: Dispatch<SetStateAction<ConfirmAction | null>>;
  reloadProducts: () => void;
};

const inputClass = "h-11 w-full rounded-xl border border-white/10 bg-[#080d1b] px-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10";

export default function ProductsPanel(props: Props) {
  const { active, ...state } = props;
  const { products, productsStatus, productsError, visibleProducts, groupedProducts, categoryOptions, activeCategoryFilter, setCategoryFilter, productQuery, setProductQuery, openProductDialog, deletingProductId, setDetailProductId, setConfirmAction, reloadProducts } = state;
  return (
<section
          hidden={!active}
          aria-labelledby="products-title"
          className="rounded-2xl border border-white/[0.08] bg-[#0d1425] p-5 shadow-xl shadow-black/10 sm:p-7"
          id="products-panel"
          role="tabpanel"
          tabIndex={0}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-200">
                <BoxIcon />
              </span>
              <div>
                <h2
                  className="text-base font-semibold text-slate-100"
                  id="products-title"
                >
                  Product Portfolio Management
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Add, edit, and curate your catalog to improve recommendations.
                </p>
              </div>
            </div>
            <button
              className="flex h-10 items-center justify-center gap-2 self-start rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              onClick={() => openProductDialog()}
              type="button"
            >
              <PlusIcon />
              Add Product
            </button>
          </div>

          <div className="mt-7 flex flex-col gap-3 border-b border-white/[0.07] pb-5 md:flex-row md:items-center">
            <label className="relative block min-w-0 flex-1">
              <span className="sr-only">Search product catalog</span>
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <input
                className={`${inputClass} pl-10`}
                onChange={(event) => setProductQuery(event.target.value)}
                placeholder="Search products by name, brand, or description..."
                type="search"
                value={productQuery}
              />
            </label>
            <label className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.08] bg-[#080d1b] px-3 text-xs text-slate-400 md:w-48">
              <FilterIcon />
              <span className="sr-only">Filter by category</span>
              <select
                className="min-w-0 flex-1 bg-transparent text-xs text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                onChange={(event) => setCategoryFilter(event.target.value)}
                value={activeCategoryFilter}
              >
                <option value="all">All Categories</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-slate-300">
              Product Catalog{" "}
              <span className="text-slate-500">
                {productsStatus === "ready" &&
                  `(${visibleProducts.length} of ${products.length} products)`}
              </span>
            </p>
            <span className="hidden text-[11px] text-slate-500 sm:block">
              Select a product to view its details
            </span>
          </div>

          <div className="mt-3 space-y-7">
            {[...groupedProducts].map(([category, items]) => (
              <section aria-labelledby={`category-${category}`} key={category}>
                <h3
                  className="flex items-center gap-2 border-b border-white/[0.06] pb-2 text-sm font-semibold text-slate-100"
                  id={`category-${category}`}
                >
                  {category}
                  <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[11px] font-medium text-slate-400">
                    {items.length}
                  </span>
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((product) => (
                    <article
                      className="group relative rounded-xl border border-white/[0.07] bg-white/[0.02] transition hover:border-indigo-300/30 hover:bg-white/[0.04]"
                      key={product.id}
                    >
                      <button
                        aria-label={`View details for ${product.name}`}
                        className="flex w-full min-w-0 items-start gap-3 rounded-xl p-3 pr-[5.5rem] text-left focus-visible:outline-2 focus-visible:outline-cyan-300"
                        onClick={() => setDetailProductId(product.id)}
                        type="button"
                      >
                        <ProductThumb product={product} />
                        <span className="block min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-100">
                            {product.name}
                          </span>
                          <span className="mt-1 block truncate text-xs text-slate-400">
                            {[product.brand, product.type, product.subType]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                          <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500">
                            {product.description}
                          </span>
                        </span>
                      </button>
                      <div className="absolute right-2 top-2 flex items-center gap-1.5">
                        <button
                          aria-label={`Edit ${product.name}`}
                          className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300"
                          onClick={() => openProductDialog(product)}
                          type="button"
                        >
                          <EditIcon />
                        </button>
                        <button
                          aria-label={`Delete ${product.name}`}
                          className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 transition hover:border-rose-300/20 hover:bg-rose-400/10 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-rose-300 disabled:opacity-50"
                          disabled={deletingProductId !== null}
                          onClick={() =>
                            setConfirmAction({ kind: "delete", product })
                          }
                          type="button"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
            {productsStatus === "loading" && (
              <p
                className="py-10 text-center text-sm text-slate-400"
                role="status"
              >
                Loading products…
              </p>
            )}
            {productsStatus === "error" && (
              <div className="py-10 text-center" role="alert">
                <p className="text-sm font-medium text-rose-300">
                  Could not load products
                </p>
                <p className="mt-1 text-xs text-slate-500">{productsError}</p>
                <button
                  className="mt-3 h-9 rounded-xl border border-white/[0.1] px-4 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
                  onClick={reloadProducts}
                  type="button"
                >
                  Retry
                </button>
              </div>
            )}
            {productsStatus === "ready" && visibleProducts.length === 0 && (
              <div className="py-10 text-center" role="status">
                <p className="text-sm font-medium text-slate-300">
                  No products found
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {products.length === 0
                    ? "There are no products yet. Add a new product to get started."
                    : "Try a different search or category, or add a new product."}
                </p>
              </div>
            )}
          </div>
        </section>


  );
}
