"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  buildDetailQuery,
  validateDetailCriteria,
  type DetailCriteria,
} from "@/lib/api/product-suggestions-core";

const emptyCriteria: DetailCriteria = {
  category: "",
  brand: "",
  maxBudget: "",
  currency: "THB",
  minRamGb: "",
  features: "",
  purpose: "",
};

const fieldClass =
  "h-11 w-full rounded-xl border border-white/10 bg-[#080d1b] px-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10";

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
      <label
        className="mb-1.5 block text-xs font-medium text-slate-300"
        htmlFor={htmlFor}
      >
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
  categories,
  brands,
  currencies,
  loading,
  onSearch,
  onReset,
}: {
  categories: string[];
  brands: string[];
  currencies: string[];
  loading: boolean;
  onSearch: (
    requirements: string,
    maxProducts: number,
    includeOutOfStock: boolean,
  ) => void;
  onReset: () => void;
}) {
  const [criteria, setCriteria] = useState<DetailCriteria>(emptyCriteria);
  const [maxProducts, setMaxProducts] = useState(3);
  const [includeOutOfStock, setIncludeOutOfStock] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const errors = validateDetailCriteria(criteria);
  const visible = showErrors ? errors : {};
  const currencyChoices = [...new Set(["THB", ...currencies])];

  function update<K extends keyof DetailCriteria>(
    key: K,
    value: DetailCriteria[K],
  ): void {
    setCriteria((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (loading) return;
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      return;
    }
    onSearch(buildDetailQuery(criteria), maxProducts, includeOutOfStock);
  }

  function reset(): void {
    setCriteria(emptyCriteria);
    setMaxProducts(3);
    setIncludeOutOfStock(false);
    setShowErrors(false);
    onReset();
  }

  const selectClass = `${fieldClass} appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9`;
  const arrow = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath d='M5.5 7.5 10 12l4.5-4.5-1-1L10 10 6.5 6.5z'/%3E%3C/svg%3E\")",
  };

  return (
    <form className="mt-5 space-y-4" noValidate onSubmit={submit}>
      <Group title="Product">
        <Field htmlFor="ds-category" label="Product category">
          <select
            className={selectClass}
            id="ds-category"
            onChange={(event) => update("category", event.target.value)}
            style={arrow}
            value={criteria.category}
          >
            <option value="">Any category</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>
        <Field htmlFor="ds-brand" label="Preferred brand">
          <select
            className={selectClass}
            id="ds-brand"
            onChange={(event) => update("brand", event.target.value)}
            style={arrow}
            value={criteria.brand}
          >
            <option value="">No preference</option>
            {brands.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field htmlFor="ds-purpose" label="Intended use / purpose">
            <input
              className={fieldClass}
              id="ds-purpose"
              maxLength={200}
              onChange={(event) => update("purpose", event.target.value)}
              placeholder="e.g. video editing, small office"
              value={criteria.purpose}
            />
          </Field>
        </div>
      </Group>

      <Group title="Budget and specifications">
        <Field
          error={visible.maxBudget}
          htmlFor="ds-budget"
          label="Maximum budget"
        >
          <input
            className={fieldClass}
            id="ds-budget"
            inputMode="decimal"
            min={0}
            onChange={(event) => update("maxBudget", event.target.value)}
            placeholder="e.g. 50000"
            type="number"
            value={criteria.maxBudget}
          />
        </Field>
        <Field htmlFor="ds-currency" label="Currency">
          <select
            className={selectClass}
            id="ds-currency"
            onChange={(event) => update("currency", event.target.value)}
            style={arrow}
            value={criteria.currency}
          >
            {currencyChoices.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>
        <Field
          error={visible.minRamGb}
          htmlFor="ds-ram"
          label="Minimum RAM (GB)"
        >
          <input
            className={fieldClass}
            id="ds-ram"
            inputMode="decimal"
            min={0}
            onChange={(event) => update("minRamGb", event.target.value)}
            placeholder="e.g. 16"
            type="number"
            value={criteria.minRamGb}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field
            hint="Separate multiple features with commas."
            htmlFor="ds-features"
            label="Required features"
          >
            <input
              className={fieldClass}
              id="ds-features"
              maxLength={300}
              onChange={(event) => update("features", event.target.value)}
              placeholder="e.g. fingerprint reader, backlit keyboard"
              value={criteria.features}
            />
          </Field>
        </div>
      </Group>

      <Group title="Results">
        <Field htmlFor="ds-max" label="Maximum products">
          <select
            className={selectClass}
            id="ds-max"
            onChange={(event) => setMaxProducts(Number(event.target.value))}
            style={arrow}
            value={maxProducts}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 self-end pb-3 text-sm text-slate-300">
          <input
            checked={includeOutOfStock}
            className="size-4 accent-indigo-500"
            onChange={(event) => setIncludeOutOfStock(event.target.checked)}
            type="checkbox"
          />
          Include out-of-stock products
        </label>
      </Group>

      {visible.form && (
        <p className="text-xs text-rose-300" role="alert">
          {visible.form}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          className="flex h-11 flex-1 items-center justify-center rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Searching…" : "Search Products"}
        </button>
        <button
          className="h-11 rounded-xl border border-white/[0.1] px-5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
          onClick={reset}
          type="button"
        >
          Clear Filters
        </button>
      </div>
      <p className="text-center text-[11px] text-slate-500">
        Your selections are combined into one request and sent to the AI product
        suggestion service.
      </p>
    </form>
  );
}
