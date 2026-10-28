import type { SuggestionRequest, SuggestionResult } from "@/features/search/domain/search-types";

export interface ProductSearchRepository {
  search(request: SuggestionRequest, signal?: AbortSignal): Promise<SuggestionResult>;
}
