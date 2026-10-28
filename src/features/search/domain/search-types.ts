export type MatchType = "exact_match" | "alternative" | "insufficient_data";
export type RankingSource = "ai" | "catalog_fallback";
export type RetrievalMode = "hybrid" | "keyword_fallback";

export type SupportingDocument = {
  documentId: string;
  title: string;
  documentType: string;
  isMock: boolean;
  approvalStatus: string;
  fileUrl: string;
  sourceName: string | null;
  sourceUrl: string | null;
};

export type Recommendation = {
  productId: number;
  name: string;
  brand: string | null;
  sku: string | null;
  category: string | null;
  sellingPrice: string;
  currency: string;
  inStock: boolean;
  stockQuantity: number;
  matchType: MatchType;
  reasons: string[];
  satisfiedRequirements: string[];
  unmetRequirements: string[];
  unverifiedRequirements: string[];
  followUpQuestion: string | null;
  supportingDocuments: SupportingDocument[];
};

export type SuggestionResult = {
  recommendations: Recommendation[];
  summary: string;
  limitations: string[];
  dataSufficiency: "sufficient" | "partial" | "insufficient";
  candidatesConsidered: number;
  exactMatchCount: number | null;
  model: string;
  rankingSource: RankingSource;
  retrievalMode: RetrievalMode;
  disclaimer: string;
};

export type SuggestionRequest = {
  requirements: string;
  max_products: number;
  include_out_of_stock: boolean;
};

export type DetailCriteria = {
  category: string;
  brand: string;
  maxBudget: string;
  currency: string;
  minRamGb: string;
  features: string;
  purpose: string;
};
