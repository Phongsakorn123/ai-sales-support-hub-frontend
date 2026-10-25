"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import type { CatalogProduct } from "@/lib/api/products";

type Criteria = {
  keyword: string;
  sku: string;
  category: string;
  brand: string;
  currency: string;
  minPrice: string;
  maxPrice: string;
  stockStatus: "" | "in_stock" | "out_of_stock";
  productStatus: "" | "active" | "discontinued";
  features: string;
};

const emptyCriteria: Criteria = {
  keyword: "",
  sku: "",
  category: "",
  brand: "",
  currency: "",
  minPrice: "",
  maxPrice: "",
  stockStatus: "",
  productStatus: "",
  features: "",
};

type Errors = Partial<Record<"minPrice" | "maxPrice", string>>;

const fieldClass =
  "h-11 w-full rounded-xl border border-white/10 bg-[#080d1b] px-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10";

function parsePrice(value: string): number | null | "invalid" {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const number = Number(trimmed);
  return Number.isFinite(number) && number >= 0 ? number : "invalid";
}

function validate(criteria: Criteria): Errors {
  const errors: Errors = {};
  const min = parsePrice(criteria.minPrice);
  const max = parsePrice(criteria.maxPrice);
  if (min === "invalid") errors.minPrice = "Enter a number of 0 or more.";
  if (max === "invalid") errors.maxPrice = "Enter a number of 0 or more.";
  if (typeof min === "number" && typeof max === "number" && min > max) {
    errors.maxPrice = "Maximum price must be at least the minimum price.";
  }
  return errors;
}

function includes(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}

function matches(product: CatalogProduct, criteria: Criteria): boolean {
  if (criteria.keyword.trim()) {
    const text = [
      product.name,
      product.brand,
      product.model,
      product.description,
      product.type,
      product.subType,
      ...product.tags,
    ].join(" ");
    const words = criteria.keyword.trim().toLowerCase().split(/\s+/);
    if (!words.every((word) => includes(text, word))) return false;
  }
  if (criteria.sku.trim() && !includes(product.sku, criteria.sku)) return false;
  if (criteria.category && product.category !== criteria.category) return false;
  if (criteria.brand && product.brand !== criteria.brand) return false;
  if (criteria.currency && product.currency !== criteria.currency) return false;

  const price = Number(product.sellingPrice);
  const min = parsePrice(criteria.minPrice);
  const max = parsePrice(criteria.maxPrice);
  if (typeof min === "number" && !(price >= min)) return false;
  if (typeof max === "number" && !(price <= max)) return false;

  const stock = Number(product.stockQuantity);
  if (criteria.stockStatus === "in_stock" && !(stock > 0)) return false;
  if (criteria.stockStatus === "out_of_stock" && stock > 0) return false;
  if (criteria.productStatus === "active" && product.discontinued) return false;
  if (criteria.productStatus === "discontinued" && !product.discontinued) {
    return false;
  }

  const terms = criteria.features
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);
  if (terms.length > 0) {
    const text = [
      product.features,
      ...product.specifications.map((spec) => `${spec.key} ${spec.value}`),
    ].join("\n");
    if (!terms.every((term) => includes(text, term))) return false;
  }
  return true;
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-300" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-[11px] text-rose-300" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-white/[0.07] p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export default function DetailedSearch({
  products,
  status,
  loadError,
  onRetry,
  onOpenProduct,
  renderThumb,
}: {
  products: CatalogProduct[];
  status: "loading" | "ready" | "error";
  loadError: string;
  onRetry: () => void;
  onOpenProduct: (id: number) => void;
  renderThumb: (product: CatalogProduct) => ReactNode;
}) {
  const [criteria, setCriteria] = useState<Criteria>(emptyCriteria);
  const [showErrors, setShowErrors] = useState(false);
  const [results, setResults] = useState<CatalogProduct[] | null>(null);

  const errors = validate(criteria);
  const visibleErrors = showErrors ? errors : {};
  const options = (pick: (product: CatalogProduct) => string) =>
    [...new Set(products.map(pick).filter(Boolean))].sort();
  const categories = options((product) => product.category);
  const brands = options((product) => product.brand);
  const currencies = options((product) => product.currency);

  function update<K extends keyof Criteria>(key: K, value: Criteria[K]): void {
    setCriteria((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (status !== "ready") return;
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      return;
    }
    setResults(products.filter((product) => matches(product, criteria)));
  }

  function clear(): void {
    setCriteria(emptyCriteria);
    setShowErrors(false);
    setResults(null);
  }

  const select = (
    id: string,
    value: string,
    onChange: (value: string) => void,
    choices: { value: string; label: string }[],
    anyLabel: string,
  ) => (
    <select
      className={`${fieldClass} appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9`}
      id={id}
      onChange={(event) => onChange(event.target.value)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath d='M5.5 7.5 10 12l4.5-4.5-1-1L10 10 6.5 6.5z'/%3E%3C/svg%3E\")",
      }}
      value={value}
    >
      <option value="">{anyLabel}</option>
      {choices.map((choice) => (
        <option key={choice.value} value={choice.value}>
          {choice.label}
        </option>
      ))}
    </select>
  );

  return (
    <div className="mt-5">
      <form className="space-y-4" noValidate onSubmit={submit}>
        <Group title="Product">
          <Field htmlFor="ds-keyword" label="Product name / keyword">
            <input
              className={fieldClass}
              id="ds-keyword"
              onChange={(event) => update("keyword", event.target.value)}
              placeholder="e.g. ThinkPad, laptop"
              value={criteria.keyword}
            />
          </Field>
          <Field htmlFor="ds-sku" label="SKU">
            <input
              className={fieldClass}
              id="ds-sku"
              onChange={(event) => update("sku", event.target.value)}
              placeholder="e.g. MOCK-COM-001"
              value={criteria.sku}
            />
          </Field>
          <Field htmlFor="ds-category" label="Category">
            {select(
              "ds-category",
              criteria.category,
              (value) => update("category", value),
              categories.map((value) => ({ value, label: value })),
              "Any category",
            )}
          </Field>
          <Field htmlFor="ds-brand" label="Brand">
            {select(
              "ds-brand",
              criteria.brand,
              (value) => update("brand", value),
              brands.map((value) => ({ value, label: value })),
              "Any brand",
            )}
          </Field>
        </Group>

        <Group title="Price and availability">
          <Field error={visibleErrors.minPrice} htmlFor="ds-min" label="Minimum price">
            <input
              className={fieldClass}
              id="ds-min"
              inputMode="decimal"
              min={0}
              onChange={(event) => update("minPrice", event.target.value)}
              placeholder="0"
              type="number"
              value={criteria.minPrice}
            />
          </Field>
          <Field error={visibleErrors.maxPrice} htmlFor="ds-max" label="Maximum price">
            <input
              className={fieldClass}
              id="ds-max"
              inputMode="decimal"
              min={0}
              onChange={(event) => update("maxPrice", event.target.value)}
              placeholder="No limit"
              type="number"
              value={criteria.maxPrice}
            />
          </Field>
          <Field
            hint="Price filters compare the number only; pick a currency to avoid mixing."
            htmlFor="ds-currency"
            label="Currency"
          >
            {select(
              "ds-currency",
              criteria.currency,
              (value) => update("currency", value),
              currencies.map((value) => ({ value, label: value })),
              "Any currency",
            )}
          </Field>
          <Field htmlFor="ds-stock" label="Stock status">
            {select(
              "ds-stock",
              criteria.stockStatus,
              (value) => update("stockStatus", value as Criteria["stockStatus"]),
              [
                { value: "in_stock", label: "In stock" },
                { value: "out_of_stock", label: "Out of stock" },
              ],
              "Any stock status",
            )}
          </Field>
          <Field htmlFor="ds-status" label="Product status">
            {select(
              "ds-status",
              criteria.productStatus,
              (value) =>
                update("productStatus", value as Criteria["productStatus"]),
              [
                { value: "active", label: "Active" },
                { value: "discontinued", label: "Discontinued" },
              ],
              "Any status",
            )}
          </Field>
        </Group>

        <Group title="Specifications">
          <div className="sm:col-span-2">
            <Field
              hint="Separate multiple terms with commas; all must match a feature or specification."
              htmlFor="ds-features"
              label="Required features / specifications"
            >
              <input
                className={fieldClass}
                id="ds-features"
                onChange={(event) => update("features", event.target.value)}
                placeholder="e.g. 16GB, SSD, fingerprint"
                value={criteria.features}
              />
            </Field>
          </div>
        </Group>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className="flex h-11 flex-1 items-center justify-center rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:opacity-60"
            disabled={status !== "ready"}
            type="submit"
          >
            {status === "loading" ? "Loading products…" : "Search Products"}
          </button>
          <button
            className="h-11 rounded-xl border border-white/[0.1] px-5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
            onClick={clear}
            type="button"
          >
            Clear Filters
          </button>
        </div>
        <p className="text-center text-[11px] text-slate-500">
          The backend has no search filters yet, so criteria are applied in the
          browser to the products loaded from the product API.
        </p>
      </form>

      {status === "error" && (
        <div className="mt-4 text-center" role="alert">
          <p className="text-sm font-medium text-rose-300">Could not load products</p>
          <p className="mt-1 text-xs text-slate-500">{loadError}</p>
          <button
            className="mt-3 h-9 rounded-lg border border-white/[0.1] px-4 text-xs text-slate-300 hover:bg-white/[0.05]"
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
        </div>
      )}

      {results && status === "ready" && (
        <section aria-live="polite" className="mt-6">
          <h3 className="text-sm font-semibold text-slate-100">
            {results.length} {results.length === 1 ? "product" : "products"} found
          </h3>
          {results.length === 0 ? (
            <p className="mt-3 rounded-xl border border-white/[0.07] px-4 py-6 text-center text-sm text-slate-400">
              No products match these criteria. Try clearing some filters.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {results.map((product) => {
                const stock = Number(product.stockQuantity);
                const state = product.discontinued
                  ? "Discontinued"
                  : stock > 0
                    ? "In Stock"
                    : "Out of Stock";
                return (
                  <li key={product.id}>
                    <button
                      aria-label={`View details for ${product.name}`}
                      className="flex w-full flex-col gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-left transition hover:border-indigo-300/30 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-cyan-300 sm:flex-row sm:items-start"
                      onClick={() => onOpenProduct(product.id)}
                      type="button"
                    >
                      {renderThumb(product)}
                      <span className="block min-w-0 flex-1">
                        <span className="block text-sm font-medium text-slate-100">
                          {product.name}
                        </span>
                        <span className="mt-1 block text-xs text-slate-400">
                          {[product.brand, product.category, product.type, product.sku]
                            .filter(Boolean)
                            .join(" · ")}
                          {product.sellingPrice &&
                            ` · ${product.sellingPrice} ${product.currency}`}
                          {` · ${state}`}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
