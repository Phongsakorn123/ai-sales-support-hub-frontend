"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { dashboardTabFromRoute } from "@/navigation/app-routes";
import { emptyProduct, type Product, type ProductFormValues } from "@/features/products/domain/product";
import type { ConfirmAction } from "@/features/dashboard/domain/dashboard";
import { useDependencies } from "@/di/dependency-provider";

import useProductSearchViewModel from "@/features/search/presentation/view-models/product-search-view-model";

const voiceLanguages = [{ code: "th-TH" }, { code: "en-US" }];

export default function useDashboardViewModel() {
  const searchParams = useSearchParams();
  const activeTab = dashboardTabFromRoute(searchParams.get("tab"));
  const search = useProductSearchViewModel();
  const { products: productUseCases, dashboard: dashboardUseCases } = useDependencies();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsStatus, setProductsStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [productsError, setProductsError] = useState("");
  const [productsReload, setProductsReload] = useState(0);
  const [productQuery, setProductQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] =
    useState<ProductFormValues>(emptyProduct);
  const [productMessage, setProductMessage] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(
    null,
  );
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [notice, setNotice] = useState<{
    tone: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [showProductErrors, setShowProductErrors] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState("en-US");
  const [detailProductId, setDetailProductId] = useState<number | null>(null);
  const productErrors = productUseCases.validateProduct(productForm);

  const categoryOptions = productUseCases.getCategoryOptions(products);
  const activeCategoryFilter = productUseCases.resolveCategoryFilter(products, categoryFilter);
  const detailProduct = products.find((product) => product.id === detailProductId) ?? null;
  const analytics = productUseCases.getCatalogAnalytics(products);
  const { activeProducts, stockUnits, inventoryValueByCurrency, productCategories } = analytics;

  useEffect(() => {
    const saved = dashboardUseCases.getVoiceLanguage();
    if (voiceLanguages.some((option) => option.code === saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVoiceLanguage(saved as string);
    }
  }, [dashboardUseCases]);

  useEffect(() => {
    const controller = new AbortController();
    productUseCases.getCatalog(controller.signal)
      .then((loaded) => {
        setProducts(loaded);
        setProductsStatus("ready");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setProductsError(
          error instanceof Error
            ? error.message
            : "Could not load products. Please try again.",
        );
        setProductsStatus("error");
      });
    return () => controller.abort();
  }, [productUseCases, productsReload]);

  function reloadProducts(): void {
    setProductsStatus("loading");
    setProductsReload((count) => count + 1);
  }

  function changeVoiceLanguage(code: string): void {
    setVoiceLanguage(code);
    dashboardUseCases.saveVoiceLanguage(code);
  }

  useEffect(() => {
    if (detailProductId === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetailProductId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [detailProductId]);

  const visibleProducts = productUseCases.filterCatalog(
    products,
    productQuery,
    activeCategoryFilter,
  );
  const groupedProducts = productUseCases.groupByCategory(visibleProducts);

  function openProductDialog(product?: Product): void {
    setEditingProductId(product?.id ?? null);
    setProductForm(product ? { ...emptyProduct, ...product } : emptyProduct);
    setProductMessage("");
    setShowProductErrors(false);
    setIsProductDialogOpen(true);
  }

  function saveProduct(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (isSavingProduct) return;
    if (Object.keys(productErrors).length > 0) {
      setShowProductErrors(true);
      setProductMessage("Please fix the highlighted fields before saving.");
      return;
    }
    if (editingProductId === null) {
      void persistProduct();
    } else {
      setConfirmAction({ kind: "update" });
    }
  }

  async function persistProduct(): Promise<void> {
    if (isSavingProduct) return;
    const isNew = editingProductId === null;
    setConfirmAction(null);
    setIsSavingProduct(true);
    setProductMessage("");
    try {
      if (editingProductId === null) {
        const created = await productUseCases.createProduct(productForm);
        setProducts((current) => [...current, created]);
      } else {
        const updated = await productUseCases.updateProduct(editingProductId, productForm);
        setProducts((current) =>
          current.map((product) =>
            product.id === updated.id ? updated : product,
          ),
        );
      }
      setIsProductDialogOpen(false);
      setNotice({
        tone: "success",
        title: isNew ? "Product added" : "Product updated",
        message: isNew
          ? `"${productForm.name.trim()}" was added successfully.`
          : `"${productForm.name.trim()}" was updated successfully.`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The product could not be saved. Please try again.";
      setProductMessage(message);
      setNotice({
        tone: "error",
        title: isNew ? "Could not add product" : "Could not update product",
        message,
      });
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function removeProduct(product: Product): Promise<void> {
    if (deletingProductId !== null) return;
    setConfirmAction(null);
    setDeletingProductId(product.id);
    try {
      await productUseCases.deleteProduct(product.id);
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
      setDetailProductId((current) =>
        current === product.id ? null : current,
      );
      setNotice({
        tone: "success",
        title: "Product deleted",
        message: `"${product.name}" was deleted.`,
      });
    } catch (error) {
      setNotice({
        tone: "error",
        title: "Could not delete product",
        message:
          error instanceof Error
            ? error.message
            : "The product could not be deleted. Please try again.",
      });
    } finally {
      setDeletingProductId(null);
    }
  }

  return {
    ...search,
    activeTab,
    products, productsStatus, productsError, reloadProducts,
    productQuery, setProductQuery, categoryFilter, setCategoryFilter,
    isProductDialogOpen, setIsProductDialogOpen, editingProductId, productForm, setProductForm,
    productMessage, isSavingProduct, deletingProductId, confirmAction, setConfirmAction,
    notice, setNotice, showProductErrors,
    voiceLanguage, detailProductId, setDetailProductId, productErrors, categoryOptions,
    activeCategoryFilter, detailProduct, activeProducts, stockUnits, inventoryValueByCurrency,
    productCategories, visibleProducts, groupedProducts, changeVoiceLanguage,
    openProductDialog, saveProduct, persistProduct, removeProduct,
  };
}
