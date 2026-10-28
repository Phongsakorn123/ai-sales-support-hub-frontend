import type { Product, ProductFormValues } from "@/features/products/domain/product";

export interface ProductRepository {
  getAll(signal?: AbortSignal): Promise<Product[]>;
  create(values: ProductFormValues): Promise<Product>;
  update(id: number, values: ProductFormValues): Promise<Product>;
  delete(id: number): Promise<void>;
}
