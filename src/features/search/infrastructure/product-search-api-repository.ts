import type { SuggestionRequest, SuggestionResult } from "@/features/search/domain/search-types";
import type { ProductSearchRepository } from "@/features/search/domain/product-search-repository";
import type { ProductSearchService } from "@/features/search/infrastructure/product-search-api-service";

export class ProductSearchApiRepository implements ProductSearchRepository {
  constructor(private readonly service: ProductSearchService) {}

  search(request: SuggestionRequest, signal?: AbortSignal): Promise<SuggestionResult> {
    return this.service.search(request, signal);
  }
}
