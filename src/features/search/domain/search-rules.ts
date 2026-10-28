import type { DetailCriteria, SuggestionRequest } from "@/features/search/domain/search-types";

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
    criteria.features,
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
  const features = criteria.features.trim();
  if (features) parts.push(`required features: ${features}`);
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
