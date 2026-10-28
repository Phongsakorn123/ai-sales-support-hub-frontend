import { buildDetailQuery, buildRequest, validateDetailCriteria, validateRequirements } from "@/features/search/domain/search-rules";
import type { DetailCriteria, SuggestionResult } from "@/features/search/domain/search-types";
import type { ProductSearchRepository } from "@/features/search/domain/product-search-repository";

export interface SearchUseCasesPort {
  validateRequirements(text: string): string | null;
  validateDetailCriteria(criteria: DetailCriteria): ReturnType<typeof validateDetailCriteria>;
  buildDetailQuery(criteria: DetailCriteria): string;
  searchProducts(requirements: string, maxProducts: number, includeOutOfStock: boolean, signal?: AbortSignal): Promise<SuggestionResult>;
}

export class SearchUseCases implements SearchUseCasesPort {
  constructor(private readonly repository: ProductSearchRepository) {}

  validateRequirements(text: string): string | null {
    return validateRequirements(text);
  }

  validateDetailCriteria(criteria: DetailCriteria) {
    return validateDetailCriteria(criteria);
  }

  buildDetailQuery(criteria: DetailCriteria): string {
    return buildDetailQuery(criteria);
  }

  searchProducts(
    requirements: string,
    maxProducts: number,
    includeOutOfStock: boolean,
    signal?: AbortSignal,
  ): Promise<SuggestionResult> {
    return this.repository.search(
      buildRequest(requirements, maxProducts, includeOutOfStock),
      signal,
    );
  }
}
