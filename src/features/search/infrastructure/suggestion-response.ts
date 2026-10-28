import type {
  MatchType,
  Recommendation,
  SuggestionResult,
  SupportingDocument,
} from "@/features/search/domain/search-types";

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

export class SuggestionFormatError extends Error {
  constructor() {
    super("The server returned an unexpected response.");
    this.name = "SuggestionFormatError";
  }
}

function parseDocument(raw: unknown): SupportingDocument | null {
  if (!isObject(raw) || typeof raw.title !== "string") return null;
  return {
    documentId:
      typeof raw.document_id === "string" ? raw.document_id : raw.title,
    title: raw.title,
    documentType:
      typeof raw.document_type === "string" ? raw.document_type : "",
    isMock: raw.is_mock === true,
    approvalStatus:
      typeof raw.approval_status === "string" ? raw.approval_status : "",
    fileUrl: typeof raw.file_url === "string" ? raw.file_url : "",
    sourceName: nullableText(raw.source_name),
    sourceUrl: nullableText(raw.source_url),
  };
}

const matchTypes: MatchType[] = [
  "exact_match",
  "alternative",
  "insufficient_data",
];

function parseRecommendation(raw: unknown): Recommendation {
  if (
    !isObject(raw) ||
    typeof raw.product_id !== "number" ||
    typeof raw.name !== "string"
  ) {
    throw new SuggestionFormatError();
  }
  const price = raw.selling_price;
  return {
    productId: raw.product_id,
    name: raw.name,
    brand: nullableText(raw.brand),
    sku: nullableText(raw.sku),
    category: nullableText(raw.category),
    sellingPrice:
      typeof price === "string" || typeof price === "number"
        ? String(price)
        : "",
    currency: typeof raw.currency === "string" ? raw.currency : "",
    inStock: raw.in_stock === true,
    stockQuantity:
      typeof raw.stock_quantity === "number" ? raw.stock_quantity : 0,
    matchType: matchTypes.includes(raw.match_type as MatchType)
      ? (raw.match_type as MatchType)
      : "insufficient_data",
    reasons: strings(raw.reasons),
    satisfiedRequirements: strings(raw.satisfied_requirements),
    unmetRequirements: strings(raw.unmet_requirements),
    unverifiedRequirements: strings(raw.unverified_requirements),
    followUpQuestion: nullableText(raw.follow_up_question),
    supportingDocuments: Array.isArray(raw.supporting_documents)
      ? raw.supporting_documents.flatMap((doc) => {
          const parsed = parseDocument(doc);
          return parsed ? [parsed] : [];
        })
      : [],
  };
}

export function parseSuggestionResponse(body: unknown): SuggestionResult {
  if (!isObject(body) || !Array.isArray(body.recommendations)) {
    throw new SuggestionFormatError();
  }
  const sufficiency = body.data_sufficiency;
  return {
    recommendations: body.recommendations.map(parseRecommendation),
    summary: typeof body.summary === "string" ? body.summary : "",
    limitations: strings(body.limitations),
    dataSufficiency:
      sufficiency === "sufficient" || sufficiency === "partial"
        ? sufficiency
        : "insufficient",
    candidatesConsidered:
      typeof body.candidates_considered === "number"
        ? body.candidates_considered
        : 0,
    exactMatchCount:
      typeof body.exact_match_count === "number" &&
      Number.isInteger(body.exact_match_count) &&
      body.exact_match_count >= 0
        ? body.exact_match_count
        : null,
    model: typeof body.model === "string" ? body.model : "",
    rankingSource:
      body.ranking_source === "catalog_fallback" ? "catalog_fallback" : "ai",
    retrievalMode:
      body.retrieval_mode === "hybrid" ? "hybrid" : "keyword_fallback",
    disclaimer: typeof body.disclaimer === "string" ? body.disclaimer : "",
  };
}
