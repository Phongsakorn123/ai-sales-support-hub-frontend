import { validateProduct, type Product, type ProductFormErrors, type ProductFormValues } from "@/features/products/domain/product";
import type { ProductRepository } from "@/features/products/domain/product-repository";
import { filterCatalog, getCatalogAnalytics, getCategoryOptions, groupByCategory, resolveCategoryFilter } from "@/features/products/domain/product-catalog";

export interface ProductUseCasesPort {
  getCatalog(signal?: AbortSignal): Promise<Product[]>;
  createProduct(values: ProductFormValues): Promise<Product>;
  updateProduct(id: number, values: ProductFormValues): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  validateProduct(values: ProductFormValues): ProductFormErrors;
  getCategoryOptions(products: Product[]): string[];
  resolveCategoryFilter(products: Product[], filter: string): string;
  filterCatalog(products: Product[], query: string, category: string): Product[];
  groupByCategory(products: Product[]): Map<string, Product[]>;
  getCatalogAnalytics(products: Product[]): ReturnType<typeof getCatalogAnalytics>;
}

export class ProductUseCases implements ProductUseCasesPort {
  constructor(private readonly repository: ProductRepository) {}

  getCatalog(signal?: AbortSignal) {
    return this.repository.getAll(signal);
  }

  createProduct(values: ProductFormValues) {
    return this.repository.create(values);
  }

  updateProduct(id: number, values: ProductFormValues) {
    return this.repository.update(id, values);
  }

  deleteProduct(id: number) {
    return this.repository.delete(id);
  }

  validateProduct(values: ProductFormValues) {
    return validateProduct(values);
  }

  getCategoryOptions(products: Awaited<ReturnType<ProductRepository["getAll"]>>) {
    return getCategoryOptions(products);
  }

  resolveCategoryFilter(products: Awaited<ReturnType<ProductRepository["getAll"]>>, filter: string) {
    return resolveCategoryFilter(products, filter);
  }

  filterCatalog(products: Awaited<ReturnType<ProductRepository["getAll"]>>, query: string, category: string) {
    return filterCatalog(products, query, category);
  }

  groupByCategory(products: Awaited<ReturnType<ProductRepository["getAll"]>>) {
    return groupByCategory(products);
  }

  getCatalogAnalytics(products: Awaited<ReturnType<ProductRepository["getAll"]>>) {
    return getCatalogAnalytics(products);
  }
}
