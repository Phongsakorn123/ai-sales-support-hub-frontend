import { fetchProtectedApi } from "@/lib/api/protected-fetch";
import { parseSuggestionResponse, SuggestionFormatError } from "@/features/search/infrastructure/suggestion-response";
import type { SuggestionRequest, SuggestionResult } from "@/features/search/domain/search-types";

export class SuggestionApiError extends Error {
  constructor(
    message: string,
    readonly kind: "auth" | "network" | "format" | "validation" | "server",
  ) {
    super(message);
    this.name = "SuggestionApiError";
  }
}

function statusMessage(status: number): string {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403)
    return "Your account is not allowed to use product search.";
  if (status === 422)
    return "The search request was not accepted. Check the requirements and try again.";
  if (status === 503)
    return "The AI product search service is not available right now.";
  if (status === 502)
    return "The AI service failed or timed out. Please try again.";
  return "Product search failed. Please try again.";
}

export async function requestProductSuggestions(
  request: SuggestionRequest,
  signal?: AbortSignal,
): Promise<SuggestionResult> {
  let response: Response;
  try {
    response = await fetchProtectedApi("/api/ai/product-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    if (
      error instanceof Error &&
      error.name === "AuthenticationRequiredError"
    ) {
      throw new SuggestionApiError(
        "Sign in is required to search products.",
        "auth",
      );
    }
    throw new SuggestionApiError(
      "Could not reach the server. Check your connection and try again.",
      "network",
    );
  }

  if (!response.ok) {
    throw new SuggestionApiError(
      statusMessage(response.status),
      response.status === 401 || response.status === 403
        ? "auth"
        : response.status === 422
          ? "validation"
          : "server",
    );
  }

  try {
    return parseSuggestionResponse(await response.json());
  } catch (error) {
    if (error instanceof SuggestionFormatError) {
      throw new SuggestionApiError(error.message, "format");
    }
    throw new SuggestionApiError(
      "The server returned an unreadable response.",
      "format",
    );
  }
}

export interface ProductSearchService {
  search(request: SuggestionRequest, signal?: AbortSignal): Promise<SuggestionResult>;
}

export class ProductSearchApiService implements ProductSearchService {
  search(
    request: SuggestionRequest,
    signal?: AbortSignal,
  ): Promise<SuggestionResult> {
    return requestProductSuggestions(request, signal);
  }
}
