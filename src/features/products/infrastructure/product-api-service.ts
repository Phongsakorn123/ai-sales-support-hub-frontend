import type { ProductDocument, ProductFormValues } from "@/features/products/domain/product";
import { mapProduct, toProductPayload, type CatalogProduct } from "@/features/products/infrastructure/product-mapper";
import { fetchProtectedApi } from "@/lib/api/protected-fetch";


export class ProductsApiError extends Error {
  constructor(
    message: string,
    readonly kind: "auth" | "network" | "format" | "server",
  ) {
    super(message);
    this.name = "ProductsApiError";
  }
}

function readMappedProduct(raw: unknown): CatalogProduct {
  try {
    return mapProduct(raw);
  } catch {
    throw new ProductsApiError("Unexpected product data.", "format");
  }
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
  return body.map((item) => readMappedProduct(item));
}

export async function fetchProductDocuments(
  productId: number,
  signal?: AbortSignal,
): Promise<ProductDocument[]> {
  let response: Response;
  try {
    response = await fetchProtectedApi(
      `/api/products/${productId}/documents`,
      { signal },
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ProductsApiError(
      "Could not reach the server to load product documents.",
      "network",
    );
  }
  if (!response.ok) {
    throw new ProductsApiError(
      response.status === 401
        ? "Your session has expired. Please sign in again."
        : "Could not load documents for this product.",
      response.status === 401 || response.status === 403 ? "auth" : "server",
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ProductsApiError(
      "The server returned unreadable product documents.",
      "format",
    );
  }
  if (!Array.isArray(body)) {
    throw new ProductsApiError(
      "The server returned an unexpected document list.",
      "format",
    );
  }
  return body.flatMap((raw): ProductDocument[] => {
    if (typeof raw !== "object" || raw === null) return [];
    const document = raw as Record<string, unknown>;
    const sourceUrl =
      typeof document.source_url === "string" ? document.source_url : null;
    if (
      typeof document.id !== "string" ||
      typeof document.title !== "string" ||
      !sourceUrl ||
      !/^https?:\/\//i.test(sourceUrl)
    ) {
      return [];
    }
    return [{
      id: document.id,
      title: document.title,
      documentType:
        typeof document.document_type === "string"
          ? document.document_type
          : "",
      isMock: document.is_mock === true,
      approvalStatus:
        typeof document.approval_status === "string"
          ? document.approval_status
          : "",
      sourceName:
        typeof document.source_name === "string"
          ? document.source_name
          : null,
      sourceUrl,
    }];
  });
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
    try {
      return mapProduct(await response.json());
    } catch {
      throw new ProductsApiError(
        "The server returned an unexpected product.",
        "format",
      );
    }
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
    body: JSON.stringify(toProductPayload(values)),
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
    body: JSON.stringify(toProductPayload(values)),
  });
  return readProduct(response);
}

export async function deleteProduct(id: number): Promise<void> {
  await sendProduct(`/api/products/${id}`, { method: "DELETE" });
}

export interface ProductApi {
  getAll(signal?: AbortSignal): Promise<CatalogProduct[]>;
  create(values: ProductFormValues): Promise<CatalogProduct>;
  update(id: number, values: ProductFormValues): Promise<CatalogProduct>;
  delete(id: number): Promise<void>;
}

export class ProductApiService implements ProductApi {
  getAll(signal?: AbortSignal): Promise<CatalogProduct[]> {
    return fetchProducts(signal);
  }

  create(values: ProductFormValues): Promise<CatalogProduct> {
    return createProduct(values);
  }

  update(id: number, values: ProductFormValues): Promise<CatalogProduct> {
    return updateProduct(id, values);
  }

  delete(id: number): Promise<void> {
    return deleteProduct(id);
  }
}
