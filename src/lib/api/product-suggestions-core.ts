// Pure request/response logic for POST /api/v1/ai/product-suggestions.
// Kept free of imports so it can be unit-tested with `node --test`.

export type MatchType = "exact_match" | "alternative" | "insufficient_data";
export type RankingSource = "ai" | "catalog_fallback";

export type SupportingDocument = {
  documentId: string;
  title: string;
  documentType: string;
  isMock: boolean;
  approvalStatus: string;
  fileUrl: string;
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
  purpose: string;
};

export const MIN_REQUIREMENTS_LENGTH = 5;
export const MAX_REQUIREMENTS_LENGTH = 2000;

export function validateRequirements(text: string): string | null {
  const length = text.trim().length;
  if (length < MIN_REQUIREMENTS_LENGTH) {
    return `Describe the need in at least ${MIN_REQUIREMENTS_LENGTH} characters.`;
  }
  if (length > MAX_REQUIREMENTS_LENGTH) {
    return `Keep the description under ${MAX_REQUIREMENTS_LENGTH} characters.`;
  }
  return null;
}

export function validateDetailCriteria(
  criteria: DetailCriteria,
): Partial<Record<"form" | "maxBudget" | "minRamGb", string>> {
  const errors: Partial<Record<"form" | "maxBudget" | "minRamGb", string>> = {};
  const budget = criteria.maxBudget.trim();
  if (budget && !(Number.isFinite(Number(budget)) && Number(budget) > 0)) {
    errors.maxBudget = "Enter a budget greater than 0.";
  }
  const ram = criteria.minRamGb.trim();
  if (ram && !(Number.isFinite(Number(ram)) && Number(ram) > 0)) {
    errors.minRamGb = "Enter a RAM size greater than 0.";
  }
  const hasAny = [
    criteria.category,
    criteria.brand,
    criteria.maxBudget,
    criteria.minRamGb,
    criteria.purpose,
  ].some((value) => value.trim());
  if (!hasAny) {
    errors.form = "Fill in at least one requirement.";
  } else if (
    !errors.maxBudget &&
    !errors.minRamGb &&
    buildDetailQuery(criteria).length < MIN_REQUIREMENTS_LENGTH
  ) {
    errors.form = "Add a little more detail to the requirements.";
  }
  return errors;
}

// The backend extracts budget, brand, category and minimum RAM from text with
// fixed rules, so the structured fields are phrased the way it parses them.
// Only fields the user filled in are included.
export function buildDetailQuery(criteria: DetailCriteria): string {
  const parts: string[] = [];
  const purpose = criteria.purpose.trim();
  const category = criteria.category.trim();
  if (category && purpose) parts.push(`${category} for ${purpose}`);
  else if (category) parts.push(category);
  else if (purpose) parts.push(`Product for ${purpose}`);

  const brand = criteria.brand.trim();
  if (brand) parts.push(`preferred brand ${brand}`);
  const budget = criteria.maxBudget.trim();
  if (budget) {
    parts.push(`under ${Number(budget)} ${criteria.currency.trim() || "THB"}`);
  }
  const ram = criteria.minRamGb.trim();
  if (ram) parts.push(`at least ${Number(ram)}GB RAM`);
  return parts.length > 0 ? `${parts.join(", ")}.` : "";
}

export function buildRequest(
  requirements: string,
  maxProducts: number,
  includeOutOfStock: boolean,
): SuggestionRequest {
  return {
    requirements: requirements.trim(),
    max_products: maxProducts,
    include_out_of_stock: includeOutOfStock,
  };
}

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
    documentId: typeof raw.document_id === "string" ? raw.document_id : raw.title,
    title: raw.title,
    documentType: typeof raw.document_type === "string" ? raw.document_type : "",
    isMock: raw.is_mock === true,
    approvalStatus:
      typeof raw.approval_status === "string" ? raw.approval_status : "",
    fileUrl: typeof raw.file_url === "string" ? raw.file_url : "",
  };
}

const matchTypes: MatchType[] = ["exact_match", "alternative", "insufficient_data"];

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
      typeof price === "string" || typeof price === "number" ? String(price) : "",
    currency: typeof raw.currency === "string" ? raw.currency : "",
    inStock: raw.in_stock === true,
    stockQuantity:
      typeof raw.stock_quantity === "number" ? raw.stock_quantity : 0,
    // Anything unknown is treated as the least-certain state, never as exact.
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
    rankingSource: body.ranking_source === "catalog_fallback" ? "catalog_fallback" : "ai",
    disclaimer: typeof body.disclaimer === "string" ? body.disclaimer : "",
  };
}
