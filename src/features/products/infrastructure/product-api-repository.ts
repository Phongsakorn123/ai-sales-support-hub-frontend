import type { Product, ProductFormValues } from "@/features/products/domain/product";
import type { ProductRepository } from "@/features/products/domain/product-repository";
import type { ProductApi } from "@/features/products/infrastructure/product-api-service";

export class ProductApiRepository implements ProductRepository {
  constructor(private readonly service: ProductApi) {}

  getAll(signal?: AbortSignal): Promise<Product[]> {
    return this.service.getAll(signal);
  }

  create(values: ProductFormValues): Promise<Product> {
    return this.service.create(values);
  }

  update(id: number, values: ProductFormValues): Promise<Product> {
    return this.service.update(id, values);
  }

  delete(id: number): Promise<void> {
    return this.service.delete(id);
  }
}
