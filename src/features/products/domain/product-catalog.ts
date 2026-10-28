import type { Product } from "@/features/products/domain/product";

export const categoryOf = (product: { category: string }) =>
  product.category.trim() || "Uncategorized";

export function getCategoryOptions(products: Product[]): string[] {
  return [...new Set(products.map(categoryOf))];
}

export function resolveCategoryFilter(products: Product[], filter: string): string {
  return getCategoryOptions(products).includes(filter) ? filter : "all";
}

export function filterCatalog(
  products: Product[],
  query: string,
  category: string,
): Product[] {
  const normalizedQuery = query.trim().toLowerCase();
  return products.filter((product) => {
    const matchesQuery =
      !normalizedQuery ||
      [product.name, product.brand, product.description].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    const matchesCategory = category === "all" || categoryOf(product) === category;
    return matchesQuery && matchesCategory;
  });
}

export function groupByCategory(products: Product[]): Map<string, Product[]> {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const category = categoryOf(product);
    groups.set(category, [...(groups.get(category) ?? []), product]);
  }
  return groups;
}

export function getCatalogAnalytics(products: Product[]) {
  const activeProducts = products.filter((product) => !product.discontinued);
  const stockUnits = products.reduce((total, product) => {
    const quantity = Number(product.stockQuantity);
    return total + (Number.isInteger(quantity) && quantity > 0 ? quantity : 0);
  }, 0);
  const inventoryValueByCurrency = products.reduce((totals, product) => {
    const price = Number(product.sellingPrice);
    const quantity = Number(product.stockQuantity);
    if (Number.isFinite(price) && price > 0 && Number.isInteger(quantity) && quantity > 0) {
      const currency = /^[A-Z]{3}$/.test(product.currency) ? product.currency : "THB";
      totals.set(currency, (totals.get(currency) ?? 0) + price * quantity);
    }
    return totals;
  }, new Map<string, number>());
  const productCategories = [...products.reduce((counts, product) => {
    const category = categoryOf(product);
    counts.set(category, (counts.get(category) ?? 0) + 1);
    return counts;
  }, new Map<string, number>())]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5);

  return { activeProducts, stockUnits, inventoryValueByCurrency, productCategories };
}
