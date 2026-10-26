"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { productImageUrl } from "@/lib/api/product-image-url";

export interface ProductSpec {
  key: string;
  value: string;
}

export interface ProductFormValues {
  name: string;
  brand: string;
  model: string;
  sku: string;
  description: string;
  imageUrl: string;
  category: string;
  type: string;
  subType: string;
  sellingPrice: string;
  currency: string;
  costPrice: string;
  stockQuantity: string;
  discontinued: boolean;
  specifications: ProductSpec[];
  features: string;
  warrantyMonths: string;
  tags: string[];
  targetCustomers: string[];
  useCases: string[];
  keyBenefits: string;
  limitations: string;
}

export type ProductFormErrors = Partial<
  Record<keyof ProductFormValues, string>
>;

export const emptyProduct: ProductFormValues = {
  name: "",
  brand: "",
  model: "",
  sku: "",
  description: "",
  imageUrl: "",
  category: "",
  type: "",
  subType: "",
  sellingPrice: "",
  currency: "THB",
  costPrice: "",
  stockQuantity: "",
  discontinued: false,
  specifications: [{ key: "", value: "" }],
  features: "",
  warrantyMonths: "",
  tags: [],
  targetCustomers: [],
  useCases: [],
  keyBenefits: "",
  limitations: "",
};

const taxonomy: Record<string, Record<string, string[]>> = {
  Computer: {
    Laptop: ["Business Laptop", "Gaming Laptop", "Ultrabook"],
    Desktop: ["Workstation", "All-in-One", "Mini PC"],
  },
  Networking: {
    Router: ["Wi-Fi Router", "Enterprise Router"],
    Switch: ["Managed Switch", "Unmanaged Switch"],
  },
  Peripherals: {
    Monitor: ["Business Monitor", "Gaming Monitor"],
    Accessory: ["Keyboard & Mouse", "Webcam", "Docking Station"],
  },
  Laboratory: {
    Chromatography: ["HPLC"],
    Analyzer: ["Portable"],
  },
  Monitoring: {
    Environment: ["Air quality"],
  },
};

const currencies = ["THB", "USD", "EUR"];
const customerSuggestions = ["SME", "Enterprise", "Education", "Government"];
const useCaseSuggestions = [
  "Office Productivity",
  "Video Conferencing",
  "Business Travel",
  "Software Development",
];
const specKeySuggestions = ["Processor", "RAM", "Storage", "Screen Size"];

export function validateProduct(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};
  const required = (
    field: "name" | "brand" | "category" | "type" | "subType",
    label: string,
  ) => {
    if (!values[field].trim()) errors[field] = `${label} is required.`;
  };
  required("name", "Product name");
  required("brand", "Brand");
  required("category", "Category");
  required("type", "Type");
  required("subType", "Sub type");

  const description = values.description.trim();
  if (!description) errors.description = "Description is required.";
  else if (description.length < 10)
    errors.description = "Description must contain at least 10 characters.";

  const url = values.imageUrl.trim();
  if (!url) errors.imageUrl = "Image URL is required.";
  else {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
        throw new Error("protocol");
    } catch {
      errors.imageUrl = "Enter a valid URL starting with http:// or https://.";
    }
  }

  const price = values.sellingPrice.trim();
  if (!price) errors.sellingPrice = "Selling price is required.";
  else if (!Number.isFinite(Number(price)) || Number(price) < 0)
    errors.sellingPrice = "Selling price must be a number of 0 or more.";

  const cost = values.costPrice.trim();
  if (cost && (!Number.isFinite(Number(cost)) || Number(cost) < 0))
    errors.costPrice = "Cost price must be a number of 0 or more.";

  const stock = values.stockQuantity.trim();
  if (!stock) errors.stockQuantity = "Stock quantity is required.";
  else if (!/^\d+$/.test(stock))
    errors.stockQuantity =
      "Stock quantity must be a whole number of 0 or more.";

  const warranty = values.warrantyMonths.trim();
  if (warranty && !/^\d+$/.test(warranty))
    errors.warrantyMonths = "Warranty must be a whole number of months.";

  return errors;
}

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-[#080d1b] px-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10";
const selectClass = `${inputClass} cursor-pointer appearance-none bg-[length:16px] bg-[position:right_0.875rem_center] bg-no-repeat pr-10 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-[#111a2c] [&>option]:text-slate-100 bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%2394a3b8' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m5 8 5 5 5-5'/%3E%3C/svg%3E")]`;
const numberClass = `${inputClass} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;
const textareaClass =
  "min-h-20 w-full resize-y rounded-xl border border-white/10 bg-[#080d1b] px-3.5 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10";
const labelClass = "mb-2 block text-xs font-medium text-slate-300";
const sectionClass = "rounded-xl border border-white/[0.07] p-4 sm:p-5";
const sectionTitleClass = "text-sm font-semibold text-slate-100";

function Field({
  label,
  error,
  helper,
  children,
  className,
}: {
  label: string;
  error?: string;
  helper?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className={labelClass}>{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-[11px] text-rose-300" role="alert">
          {error}
        </span>
      ) : (
        helper && (
          <span className="mt-1 block text-[11px] text-slate-500">
            {helper}
          </span>
        )
      )}
    </label>
  );
}

function TagInput({
  label,
  values,
  onChange,
  placeholder,
  suggestions = [],
  helper,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  suggestions?: string[];
  helper?: string;
}) {
  const [draft, setDraft] = useState("");

  function add(raw: string): void {
    const value = raw.trim();
    if (value && !values.some((v) => v.toLowerCase() === value.toLowerCase())) {
      onChange([...values, value]);
    }
    setDraft("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  }

  const remaining = suggestions.filter(
    (s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div>
      <span className={labelClass}>{label}</span>
      {values.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {values.map((value) => (
            <li
              className="flex items-center gap-1 rounded-lg bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100"
              key={value}
            >
              {value}
              <button
                aria-label={`Remove ${value}`}
                className="text-cyan-200/70 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300"
                onClick={() => onChange(values.filter((v) => v !== value))}
                type="button"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        aria-label={label}
        className={inputClass}
        onBlur={() => add(draft)}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        value={draft}
      />
      <span className="mt-1 block text-[11px] text-slate-500">
        {helper ?? "Press Enter or comma to add."}
      </span>
      {remaining.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {remaining.map((s) => (
            <button
              className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-slate-400 transition hover:bg-white/[0.05] hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-cyan-300"
              key={s}
              onClick={() => add(s)}
              type="button"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function optionsWith(options: string[], current: string): string[] {
  return current && !options.includes(current)
    ? [current, ...options]
    : options;
}

export default function ProductFormFields({
  values,
  onChange,
  errors,
  showAllErrors,
}: {
  values: ProductFormValues;
  onChange: (values: ProductFormValues) => void;
  errors: ProductFormErrors;
  showAllErrors: boolean;
}) {
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [imageFailed, setImageFailed] = useState("");

  const set = <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
  ) => onChange({ ...values, [field]: value });
  const touch = (field: string) =>
    setTouched((current) => new Set(current).add(field));
  const err = (field: keyof ProductFormValues) =>
    showAllErrors || touched.has(field) ? errors[field] : undefined;
  const bind = (field: keyof ProductFormValues) => ({
    onBlur: () => touch(field),
    "aria-invalid": err(field) ? true : undefined,
  });

  const categories = optionsWith(Object.keys(taxonomy), values.category);
  const types = optionsWith(
    Object.keys(taxonomy[values.category] ?? {}),
    values.type,
  );
  const subTypes = optionsWith(
    taxonomy[values.category]?.[values.type] ?? [],
    values.subType,
  );

  const stock = values.stockQuantity.trim();
  const stockNumber = /^\d+$/.test(stock) ? Number(stock) : null;
  const availability = values.discontinued
    ? "Discontinued"
    : stockNumber === null
      ? "Enter stock quantity"
      : stockNumber > 0
        ? "In Stock"
        : "Out of Stock";
  const availabilityColor =
    availability === "In Stock"
      ? "bg-emerald-400/10 text-emerald-200"
      : availability === "Enter stock quantity"
        ? "bg-white/[0.05] text-slate-400"
        : "bg-rose-400/10 text-rose-200";

  const imageUrl = values.imageUrl.trim();
  const canPreview = imageUrl && !errors.imageUrl;

  function updateSpec(index: number, patch: Partial<ProductSpec>): void {
    set(
      "specifications",
      values.specifications.map((spec, i) =>
        i === index ? { ...spec, ...patch } : spec,
      ),
    );
  }

  return (
    <div className="space-y-4">
      <fieldset className={sectionClass}>
        <legend className={`${sectionTitleClass} px-1`}>
          Basic Information
        </legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <Field error={err("name")} label="Product Name *">
            <input
              {...bind("name")}
              autoFocus
              className={inputClass}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. ThinkPad X1 Carbon"
              value={values.name}
            />
          </Field>
          <Field error={err("brand")} label="Brand *">
            <input
              {...bind("brand")}
              className={inputClass}
              onChange={(e) => set("brand", e.target.value)}
              placeholder="e.g. Lenovo"
              value={values.brand}
            />
          </Field>
          <Field label="Model">
            <input
              className={inputClass}
              onChange={(e) => set("model", e.target.value)}
              placeholder="e.g. Gen 12"
              value={values.model}
            />
          </Field>
          <Field helper="Your internal stock-keeping unit." label="SKU">
            <input
              className={inputClass}
              onChange={(e) => set("sku", e.target.value)}
              placeholder="e.g. LNV-X1C-G12"
              value={values.sku}
            />
          </Field>
        </div>

        <Field
          className="mt-4"
          error={err("description")}
          label="Description * (minimum 10 characters)"
        >
          <textarea
            {...bind("description")}
            className={textareaClass}
            maxLength={1000}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Briefly describe the product for sales teams and customers."
            value={values.description}
          />
          <span className="mt-1 block text-[11px] text-slate-500">
            {values.description.length}/1000 characters
          </span>
        </Field>

        <Field
          className="mt-4"
          error={err("imageUrl")}
          helper="Link to a product image (http or https)."
          label="Image URL *"
        >
          <input
            {...bind("imageUrl")}
            className={inputClass}
            inputMode="url"
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://example.com/product.jpg"
            type="url"
            value={values.imageUrl}
          />
        </Field>
        {canPreview && (
          <div className="mt-2 flex h-32 items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-[#080d1b]">
            {imageFailed === imageUrl ? (
              <span className="text-xs text-slate-500">
                Image could not be loaded.
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Product preview"
                className="max-h-full max-w-full object-contain"
                onError={() => setImageFailed(imageUrl)}
                src={productImageUrl(imageUrl)}
              />
            )}
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field error={err("category")} label="Category *">
            <select
              {...bind("category")}
              className={selectClass}
              onChange={(e) =>
                onChange({
                  ...values,
                  category: e.target.value,
                  type: "",
                  subType: "",
                })
              }
              value={values.category}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field error={err("type")} label="Type *">
            <select
              {...bind("type")}
              className={selectClass}
              disabled={!values.category}
              onChange={(e) =>
                onChange({ ...values, type: e.target.value, subType: "" })
              }
              value={values.type}
            >
              <option value="">Select type</option>
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field error={err("subType")} label="Sub Type *">
            <select
              {...bind("subType")}
              className={selectClass}
              disabled={!values.type}
              onChange={(e) => set("subType", e.target.value)}
              value={values.subType}
            >
              <option value="">Select sub type</option>
              {subTypes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className={sectionClass}>
        <legend className={`${sectionTitleClass} px-1`}>
          Pricing and Inventory
        </legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <Field error={err("sellingPrice")} label="Selling Price *">
            <input
              {...bind("sellingPrice")}
              className={numberClass}
              inputMode="decimal"
              min={0}
              onChange={(e) => set("sellingPrice", e.target.value)}
              placeholder="0.00"
              step="0.01"
              type="number"
              value={values.sellingPrice}
            />
          </Field>
          <Field label="Currency *">
            <select
              className={selectClass}
              onChange={(e) => set("currency", e.target.value)}
              value={values.currency}
            >
              {currencies.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field
            error={err("costPrice")}
            helper="Optional, internal only."
            label="Cost Price"
          >
            <input
              {...bind("costPrice")}
              className={numberClass}
              inputMode="decimal"
              min={0}
              onChange={(e) => set("costPrice", e.target.value)}
              placeholder="0.00"
              step="0.01"
              type="number"
              value={values.costPrice}
            />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field error={err("stockQuantity")} label="Stock Quantity *">
            <input
              {...bind("stockQuantity")}
              className={numberClass}
              inputMode="numeric"
              min={0}
              onChange={(e) => set("stockQuantity", e.target.value)}
              placeholder="0"
              step={1}
              type="number"
              value={values.stockQuantity}
            />
          </Field>
          <div>
            <span className={labelClass}>Availability Status</span>
            <div className="flex h-11 items-center justify-between gap-3">
              <span
                aria-live="polite"
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${availabilityColor}`}
              >
                {availability}
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  checked={values.discontinued}
                  className="size-4 accent-indigo-500"
                  onChange={(e) => set("discontinued", e.target.checked)}
                  type="checkbox"
                />
                Discontinued
              </label>
            </div>
          </div>
        </div>
      </fieldset>

      <details className={`group ${sectionClass}`}>
        <summary
          className={`${sectionTitleClass} flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden`}
        >
          <span
            aria-hidden="true"
            className="text-slate-500 transition-transform group-open:rotate-90"
          >
            ›
          </span>
          Technical Specifications{" "}
          <span className="text-[11px] font-normal text-slate-500">
            (optional)
          </span>
        </summary>
        <div className="mt-4 space-y-4">
          <div>
            <span className={labelClass}>Specifications</span>
            <div className="space-y-2">
              {values.specifications.map((spec, index) => (
                <div
                  className="grid grid-cols-[1fr_1fr_auto] gap-2"
                  key={index}
                >
                  <input
                    aria-label={`Specification ${index + 1} name`}
                    className={inputClass}
                    list="spec-key-suggestions"
                    onChange={(e) => updateSpec(index, { key: e.target.value })}
                    placeholder="e.g. Processor"
                    value={spec.key}
                  />
                  <input
                    aria-label={`Specification ${index + 1} value`}
                    className={inputClass}
                    onChange={(e) =>
                      updateSpec(index, { value: e.target.value })
                    }
                    placeholder="e.g. Intel Core i7"
                    value={spec.value}
                  />
                  <button
                    aria-label={`Remove specification ${index + 1}`}
                    className="h-11 rounded-xl border border-white/10 px-3 text-slate-400 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300"
                    onClick={() =>
                      set(
                        "specifications",
                        values.specifications.length > 1
                          ? values.specifications.filter((_, i) => i !== index)
                          : [{ key: "", value: "" }],
                      )
                    }
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <datalist id="spec-key-suggestions">
              {specKeySuggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <button
              className="mt-2 h-9 rounded-xl border border-white/10 px-3 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
              onClick={() =>
                set("specifications", [
                  ...values.specifications,
                  { key: "", value: "" },
                ])
              }
              type="button"
            >
              + Add specification
            </button>
          </div>

          <Field helper="One feature per line." label="Features">
            <textarea
              className={textareaClass}
              onChange={(e) => set("features", e.target.value)}
              placeholder={"Backlit keyboard\nFingerprint reader"}
              value={values.features}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              error={err("warrantyMonths")}
              label="Warranty Period (months)"
            >
              <input
                {...bind("warrantyMonths")}
                className={numberClass}
                inputMode="numeric"
                min={0}
                onChange={(e) => set("warrantyMonths", e.target.value)}
                placeholder="e.g. 36"
                step={1}
                type="number"
                value={values.warrantyMonths}
              />
            </Field>
          </div>

          <TagInput
            label="Tags"
            onChange={(tags) => set("tags", tags)}
            placeholder="e.g. ultrabook, lightweight"
            values={values.tags}
          />
        </div>
      </details>

      <details className={`group ${sectionClass}`}>
        <summary
          className={`${sectionTitleClass} flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden`}
        >
          <span
            aria-hidden="true"
            className="text-slate-500 transition-transform group-open:rotate-90"
          >
            ›
          </span>
          AI Recommendation Context{" "}
          <span className="text-[11px] font-normal text-slate-500">
            (optional)
          </span>
        </summary>
        <div className="mt-4 space-y-4">
          <p className="text-[11px] text-slate-500">
            Helps describe who this product suits. These details are stored with
            the product form only; AI recommendations are not connected yet.
          </p>
          <TagInput
            label="Target Customer"
            onChange={(v) => set("targetCustomers", v)}
            placeholder="e.g. SME"
            suggestions={customerSuggestions}
            values={values.targetCustomers}
          />
          <TagInput
            label="Use Cases"
            onChange={(v) => set("useCases", v)}
            placeholder="e.g. Video Conferencing"
            suggestions={useCaseSuggestions}
            values={values.useCases}
          />
          <Field label="Key Benefits">
            <textarea
              className={textareaClass}
              onChange={(e) => set("keyBenefits", e.target.value)}
              placeholder="Main benefits for the customer"
              value={values.keyBenefits}
            />
          </Field>
          <Field
            helper="Optional: constraints or unsuitable use cases."
            label="Limitations"
          >
            <textarea
              className={textareaClass}
              onChange={(e) => set("limitations", e.target.value)}
              placeholder="e.g. Not suited for heavy 3D rendering"
              value={values.limitations}
            />
          </Field>
        </div>
      </details>
    </div>
  );
}
