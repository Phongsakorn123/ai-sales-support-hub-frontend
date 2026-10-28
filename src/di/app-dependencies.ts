import { AuthUseCases, type AuthUseCasesPort } from "@/features/auth/application/auth-use-cases";
import { AuthApiRepository } from "@/features/auth/infrastructure/auth-api-repository";
import { BrowserSessionService, HttpAuthApiService } from "@/features/auth/infrastructure/auth-services";
import { ProductUseCases, type ProductUseCasesPort } from "@/features/products/application/product-use-cases";
import { ProductApiRepository } from "@/features/products/infrastructure/product-api-repository";
import { ProductApiService } from "@/features/products/infrastructure/product-api-service";
import { DashboardUseCases, type DashboardUseCasesPort } from "@/features/dashboard/application/dashboard-use-cases";
import { BrowserDashboardPreferencesRepository } from "@/features/dashboard/infrastructure/dashboard-preferences-repository";
import { BrowserDashboardPreferencesService } from "@/features/dashboard/infrastructure/dashboard-preferences-service";
import { SearchUseCases, type SearchUseCasesPort } from "@/features/search/application/search-use-cases";
import { ProductSearchApiRepository } from "@/features/search/infrastructure/product-search-api-repository";
import { ProductSearchApiService } from "@/features/search/infrastructure/product-search-api-service";

export type AppDependencies = {
  auth: AuthUseCasesPort;
  products: ProductUseCasesPort;
  search: SearchUseCasesPort;
  dashboard: DashboardUseCasesPort;
};

export function createAppDependencies(): AppDependencies {
  const productService = new ProductApiService();
  const searchService = new ProductSearchApiService();

  return {
    auth: new AuthUseCases(
      new AuthApiRepository(new HttpAuthApiService(), new BrowserSessionService()),
    ),
    products: new ProductUseCases(new ProductApiRepository(productService)),
    search: new SearchUseCases(
      new ProductSearchApiRepository(searchService),
    ),
    dashboard: new DashboardUseCases(
      new BrowserDashboardPreferencesRepository(
        new BrowserDashboardPreferencesService(),
      ),
    ),
  };
}
