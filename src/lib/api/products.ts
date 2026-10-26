import type { ProductFormValues } from "@/components/dashboard/product-form";
import { fetchProtectedApi } from "@/lib/api/protected-fetch";

export type CatalogProduct = ProductFormValues & { id: number };

export class ProductsApiError extends Error {
  constructor(
    message: string,
    readonly kind: "auth" | "network" | "format" | "server",
  ) {
    super(message);
    this.name = "ProductsApiError";
  }
}

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

function mapProduct(raw: unknown): CatalogProduct {
  if (typeof raw !== "object" || raw === null) {
    throw new ProductsApiError("Unexpected product data.", "format");
  }
  const item = raw as Json;
  if (typeof item.id !== "number" || typeof item.name !== "string") {
    throw new ProductsApiError("Unexpected product data.", "format");
  }

  const specifications = Array.isArray(item.specifications)
    ? item.specifications.flatMap((spec) => {
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

export async function fetchProducts(
  signal?: AbortSignal,
): Promise<CatalogProduct[]> {
  let response: Response;
  try {
    response = await fetchProtectedApi("/api/products", { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    if (
      error instanceof Error &&
      error.name === "AuthenticationRequiredError"
    ) {
      throw new ProductsApiError(
        "Sign in is required to view products.",
        "auth",
      );
    }
    throw new ProductsApiError(
      "Could not reach the server. Check your connection and try again.",
      "network",
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new ProductsApiError(
      response.status === 401
        ? "Your session has expired. Please sign in again."
        : "Your account is not allowed to view products.",
      "auth",
    );
  }
  if (!response.ok) {
    throw new ProductsApiError(
      response.status === 503
        ? "The product service is unavailable. Please try again."
        : "Could not load products. Please try again.",
      "server",
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ProductsApiError(
      "The server returned an unreadable response.",
      "format",
    );
  }
  if (!Array.isArray(body)) {
    throw new ProductsApiError(
      "The server returned an unexpected response.",
      "format",
    );
  }
  return body.map(mapProduct);
}

function optionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function optionalNumber(value: string): number | null {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : null;
}

function toPayload(values: ProductFormValues): Json {
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

async function failureMessage(response: Response): Promise<string> {
  if (response.status === 401)
    return "Your session has expired. Please sign in again.";
  if (response.status === 403)
    return "Your account is not allowed to change products.";
  if (response.status === 404)
    return "This product no longer exists. Reload the list.";
  if (response.status === 409) return "A product with this SKU already exists.";
  if (response.status === 422) {
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (Array.isArray(body.detail) && body.detail.length > 0) {
        const first = body.detail[0] as { loc?: unknown[]; msg?: string };
        const field = first.loc?.[first.loc.length - 1];
        return `Invalid value${field ? ` for ${String(field)}` : ""}: ${first.msg ?? "rejected by server"}.`;
      }
    } catch {}
    return "The server rejected the product data.";
  }
  if (response.status === 503)
    return "The product service is unavailable. Please try again.";
  return "The product could not be saved. Please try again.";
}

async function sendProduct(path: string, init: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetchProtectedApi(path, init);
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AuthenticationRequiredError"
    ) {
      throw new ProductsApiError(
        "Sign in is required to change products.",
        "auth",
      );
    }
    throw new ProductsApiError(
      "Could not reach the server. Check your connection and try again.",
      "network",
    );
  }
  if (!response.ok) {
    throw new ProductsApiError(
      await failureMessage(response),
      response.status === 401 || response.status === 403 ? "auth" : "server",
    );
  }
  return response;
}

async function readProduct(response: Response): Promise<CatalogProduct> {
  try {
    return mapProduct(await response.json());
  } catch (error) {
    if (error instanceof ProductsApiError) throw error;
    throw new ProductsApiError(
      "The server returned an unreadable response.",
      "format",
    );
  }
}

export async function createProduct(
  values: ProductFormValues,
): Promise<CatalogProduct> {
  const response = await sendProduct("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });
  return readProduct(response);
}

export async function updateProduct(
  id: number,
  values: ProductFormValues,
): Promise<CatalogProduct> {
  const response = await sendProduct(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });
  return readProduct(response);
}

export async function deleteProduct(id: number): Promise<void> {
  await sendProduct(`/api/products/${id}`, { method: "DELETE" });
}
