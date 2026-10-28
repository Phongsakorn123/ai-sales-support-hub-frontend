"use client";

import { useState } from "react";
import BasicInformationFields from "@/features/products/presentation/components/basic-information-fields";
import InventoryFields from "@/features/products/presentation/components/inventory-fields";
import TechnicalFields from "@/features/products/presentation/components/technical-fields";
import RecommendationFields from "@/features/products/presentation/components/recommendation-fields";
import { optionsWith, taxonomy } from "@/features/products/presentation/components/product-form-controls";
import {
  type ProductFormErrors,
  type ProductFormValues,
  type ProductSpec,
} from "@/features/products/domain/product";

export { emptyProduct, validateProduct } from "@/features/products/domain/product";
export type { ProductFormErrors, ProductFormValues, ProductSpec } from "@/features/products/domain/product";



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
      <BasicInformationFields values={values} set={set} err={err} bind={bind} categories={categories} types={types} subTypes={subTypes} canPreview={Boolean(canPreview)} imageUrl={imageUrl} imageFailed={imageFailed} setImageFailed={setImageFailed} onChange={onChange} />
      <InventoryFields values={values} set={set} err={err} bind={bind} availability={availability} availabilityColor={availabilityColor} />
      <TechnicalFields values={values} set={set} err={err} bind={bind} updateSpec={updateSpec} />
      <RecommendationFields values={values} set={set} err={err} bind={bind} />
    </div>
  );
}
