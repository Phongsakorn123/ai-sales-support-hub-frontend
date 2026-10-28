import type {
  ProductFormValues,
  ProductSpec,
} from "@/features/products/domain/product";

export type CatalogProduct = ProductFormValues & { id: number };
type Json = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function amount(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return typeof value === "string" ? value : "";
}

function integer(value: unknown): string {
  return typeof value === "number" && Number.isInteger(value)
    ? String(value)
    : "";
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function mapProduct(raw: unknown): CatalogProduct {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Unexpected product data.");
  }
  const item = raw as Json;
  if (typeof item.id !== "number" || typeof item.name !== "string") {
    throw new Error("Unexpected product data.");
  }

  const specifications = Array.isArray(item.specifications)
    ? item.specifications.flatMap((spec): ProductSpec[] => {
        const entry = spec as Json | null;
        return entry && typeof entry.key === "string"
          ? [{ key: entry.key, value: text(entry.value) }]
          : [];
      })
    : [];

  return {
    id: item.id,
    name: item.name,
    brand: text(item.brand),
    model: text(item.model),
    sku: text(item.sku),
    description: text(item.description),
    imageUrl: text(item.image_url),
    category: text(item.category),
    type: text(item.type),
    subType: text(item.sub_type),
    sellingPrice: amount(item.selling_price),
    currency: text(item.currency) || "THB",
    costPrice: amount(item.cost_price),
    stockQuantity: integer(item.stock_quantity),
    discontinued: item.discontinued === true,
    specifications,
    features: strings(item.features).join("\n"),
    warrantyMonths: integer(item.warranty_months),
    tags: strings(item.tags),
    targetCustomers: strings(item.target_customers),
    useCases: strings(item.use_cases),
    keyBenefits: text(item.key_benefits),
    limitations: text(item.limitations),
  };
}

function optionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function optionalNumber(value: string): number | null {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : null;
}

export function toProductPayload(values: ProductFormValues): Json {
  return {
    name: values.name.trim(),
    brand: optionalText(values.brand),
    model: optionalText(values.model),
    sku: optionalText(values.sku),
    description: optionalText(values.description),
    image_url: optionalText(values.imageUrl),
    category: optionalText(values.category),
    type: optionalText(values.type),
    sub_type: optionalText(values.subType),
    selling_price: Number(values.sellingPrice),
    currency: values.currency.trim().toUpperCase(),
    cost_price: optionalNumber(values.costPrice),
    stock_quantity: Number(values.stockQuantity),
    discontinued: values.discontinued,
    specifications: values.specifications
      .map((spec) => ({ key: spec.key.trim(), value: spec.value.trim() }))
      .filter((spec) => spec.key && spec.value),
    features: values.features
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean),
    warranty_months: optionalNumber(values.warrantyMonths),
    tags: values.tags,
    target_customers: values.targetCustomers,
    use_cases: values.useCases,
    key_benefits: optionalText(values.keyBenefits),
    limitations: optionalText(values.limitations),
  };
}
