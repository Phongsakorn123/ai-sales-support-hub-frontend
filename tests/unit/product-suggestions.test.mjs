import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDetailQuery,
  buildRequest,
  validateDetailCriteria,
  validateRequirements,
} from "../../src/features/search/domain/search-rules.ts";
import { parseSuggestionResponse, SuggestionFormatError } from "../../src/features/search/infrastructure/suggestion-response.ts";

const empty = {
  category: "",
  brand: "",
  maxBudget: "",
  currency: "THB",
  minRamGb: "",
  features: "",
  purpose: "",
};

const recommendation = (overrides = {}) => ({
  product_id: 1,
  name: "Laptop A",
  brand: "Dell",
  sku: "SKU-1",
  category: "Computer",
  selling_price: "45000.00",
  currency: "THB",
  in_stock: true,
  stock_quantity: 4,
  match_type: "exact_match",
  reasons: ["Fits budget"],
  satisfied_requirements: ["Budget"],
  unmet_requirements: ["Brand"],
  unverified_requirements: ["RAM"],
  follow_up_question: "Which OS?",
  supporting_documents: [
    {
      document_id: "d1",
      title: "Spec sheet",
      document_type: "datasheet",
      is_mock: true,
      approval_status: "approved",
      file_url: "/docs/d1",
    },
  ],
  ...overrides,
});

const response = (overrides = {}) => ({
  parsed_requirements: {},
  recommendations: [recommendation()],
  summary: "One product",
  limitations: ["Demo data"],
  data_sufficiency: "partial",
  candidates_considered: 5,
  exact_match_count: 1,
  model: "m",
  ranking_source: "ai",
  disclaimer: "d",
  ...overrides,
});

test("quick search request uses the exact backend field names and trims", () => {
  assert.deepEqual(buildRequest("  laptop under 50000 THB  ", 4, true), {
    requirements: "laptop under 50000 THB",
    max_products: 4,
    include_out_of_stock: true,
  });
});

test("requirements validation mirrors the backend 5-2000 character limit", () => {
  assert.ok(validateRequirements("   abc "));
  assert.equal(validateRequirements("laptop"), null);
  assert.ok(validateRequirements("x".repeat(2001)));
});

test("detail search maps only the selected fields into readable text", () => {
  assert.equal(
    buildDetailQuery({
      category: "Laptop",
      brand: "Dell",
      maxBudget: "50000",
      currency: "THB",
      minRamGb: "16",
      features: "SSD, fingerprint reader",
      purpose: "video editing",
    }),
    "Laptop for video editing, preferred brand Dell, under 50000 THB, at least 16GB RAM, required features: SSD, fingerprint reader.",
  );
  assert.equal(
    buildDetailQuery({ ...empty, category: "Laptop", maxBudget: "3000" }),
    "Laptop, under 3000 THB.",
  );
  assert.equal(
    buildDetailQuery({ ...empty, category: "Laptop", maxBudget: "3000", currency: "USD" }),
    "Laptop, under 3000 USD.",
  );
  assert.equal(buildDetailQuery({ ...empty, category: "Monitor" }), "Monitor.");
  assert.equal(buildDetailQuery({ ...empty, minRamGb: "8" }), "at least 8GB RAM.");
});

test("detail validation rejects empty, negative and non-numeric input", () => {
  assert.ok(validateDetailCriteria(empty).form);
  assert.ok(validateDetailCriteria({ ...empty, maxBudget: "-1" }).maxBudget);
  assert.ok(validateDetailCriteria({ ...empty, minRamGb: "abc" }).minRamGb);
  assert.deepEqual(
    validateDetailCriteria({ ...empty, category: "Laptop", maxBudget: "100" }),
    {},
  );
});

test("parses exact, alternative and insufficient_data without upgrading them", () => {
  const parsed = parseSuggestionResponse(
    response({
      recommendations: [
        recommendation({ match_type: "alternative" }),
        recommendation({ product_id: 2, match_type: "insufficient_data" }),
        recommendation({ product_id: 3, match_type: "something_new" }),
        recommendation({ product_id: 4 }),
      ],
    }),
  );
  assert.deepEqual(
    parsed.recommendations.map((item) => item.matchType),
    ["alternative", "insufficient_data", "insufficient_data", "exact_match"],
  );
});

test("keeps satisfied, unmet and unverified requirements separate", () => {
  const [item] = parseSuggestionResponse(response()).recommendations;
  assert.deepEqual(item.satisfiedRequirements, ["Budget"]);
  assert.deepEqual(item.unmetRequirements, ["Brand"]);
  assert.deepEqual(item.unverifiedRequirements, ["RAM"]);
  assert.equal(item.followUpQuestion, "Which OS?");
  assert.equal(item.supportingDocuments[0].isMock, true);
  assert.equal(item.sellingPrice, "45000.00");
});

test("catalog fallback and exact match count are preserved only when valid", () => {
  const fallback = parseSuggestionResponse(
    response({ ranking_source: "catalog_fallback" }),
  );
  assert.equal(fallback.rankingSource, "catalog_fallback");
  assert.equal(fallback.exactMatchCount, 1);
  assert.equal(
    parseSuggestionResponse(response({ exact_match_count: "3" })).exactMatchCount,
    null,
  );
  assert.equal(
    parseSuggestionResponse(response({ exact_match_count: -1 })).exactMatchCount,
    null,
  );
});

test("retrieval mode distinguishes hybrid results from keyword-only fallback", () => {
  assert.equal(parseSuggestionResponse(response({ retrieval_mode: "hybrid" })).retrievalMode, "hybrid");
  assert.equal(parseSuggestionResponse(response({ retrieval_mode: "keyword_fallback" })).retrievalMode, "keyword_fallback");
  assert.equal(parseSuggestionResponse(response({ retrieval_mode: "unknown" })).retrievalMode, "keyword_fallback");
});

test("empty recommendations parse as an empty list", () => {
  const parsed = parseSuggestionResponse(
    response({ recommendations: [], data_sufficiency: "insufficient" }),
  );
  assert.equal(parsed.recommendations.length, 0);
  assert.equal(parsed.dataSufficiency, "insufficient");
});

test("unexpected response shapes throw SuggestionFormatError", () => {
  assert.throws(() => parseSuggestionResponse(null), SuggestionFormatError);
  assert.throws(() => parseSuggestionResponse({}), SuggestionFormatError);
  assert.throws(
    () => parseSuggestionResponse(response({ recommendations: [{ name: 1 }] })),
    SuggestionFormatError,
  );
});

test("quick and detail search share one request builder and one response parser", async () => {
  const { readFileSync } = await import("node:fs");
  const viewModel = readFileSync(
    "src/features/search/presentation/view-models/product-search-view-model.ts",
    "utf8",
  );
  assert.equal((viewModel.match(/searchUseCases\.searchProducts\(/g) ?? []).length, 1);
  assert.match(viewModel, /runSuggestion\(searchText\.trim\(\)/);

  const searchPanel = readFileSync(
    "src/features/dashboard/presentation/components/search-panel.tsx",
    "utf8",
  );
  assert.match(searchPanel, /onSearch=\{\(requirements, max, oos\) =>\s*void runSuggestion\(requirements, max, oos\)/);

  const detail = readFileSync(
    "src/features/search/presentation/components/detailed-search.tsx",
    "utf8",
  );
  assert.doesNotMatch(detail, /searchProducts|fetch/);
});
