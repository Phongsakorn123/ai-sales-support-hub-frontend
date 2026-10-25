"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import ProductFormFields, {
  emptyProduct,
  validateProduct,
  type ProductFormValues,
} from "@/components/dashboard/product-form";
import DetailedSearch from "@/components/dashboard/detailed-search";
import VoiceSearch from "@/components/dashboard/voice-search";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  ProductsApiError,
  updateProduct,
} from "@/lib/api/products";
import LogoutButton from "@/features/auth/presentation/components/logout-button";

type DashboardTab = "search" | "products" | "analytics";

type Product = ProductFormValues & { id: number };

const tabs: { id: DashboardTab; label: string; icon: ReactNode }[] = [
  { id: "search", label: "Product Search", icon: <SearchIcon /> },
  { id: "products", label: "Manage Products", icon: <BoxIcon /> },
  { id: "analytics", label: "Analytics Dashboard", icon: <ChartIcon /> },
];

const voiceLanguages = [
  { code: "th-TH", short: "TH", name: "ไทย (Thai)" },
  { code: "en-US", short: "EN", name: "English" },
];
const VOICE_LANGUAGE_KEY = "voice-search-language";

const UNCATEGORIZED = "Uncategorized";

function categoryOf(product: { category: string }): string {
  return product.category.trim() || UNCATEGORIZED;
}

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-[#080d1b] px-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10";

export default function DashboardWorkspace() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("search");
  const [products, setProducts] = useState<Product[]>([]);
  const [productsStatus, setProductsStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [productsError, setProductsError] = useState("");
  const [productsReload, setProductsReload] = useState(0);
  const [searchMode, setSearchMode] = useState<"quick" | "detailed">("quick");
  const [searchText, setSearchText] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] =
    useState<ProductFormValues>(emptyProduct);
  const [productMessage, setProductMessage] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    { kind: "update" } | { kind: "delete"; product: Product } | null
  >(null);
  const [notice, setNotice] = useState<{
    tone: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [showProductErrors, setShowProductErrors] = useState(false);
  const [searchResults, setSearchResults] = useState<
    { product: Product; score: number; reason: string }[] | null
  >(null);
  const [voiceLanguage, setVoiceLanguage] = useState("en-US");
  const [detailProductId, setDetailProductId] = useState<number | null>(null);
  const productErrors = validateProduct(productForm);

  const categoryOptions = [...new Set(products.map(categoryOf))];
  const activeCategoryFilter = categoryOptions.includes(categoryFilter)
    ? categoryFilter
    : "all";
  const detailProduct =
    products.find((product) => product.id === detailProductId) ?? null;

  useEffect(() => {
    const saved = window.localStorage.getItem(VOICE_LANGUAGE_KEY);
    if (voiceLanguages.some((option) => option.code === saved)) {
      // Restore the saved choice after hydration to avoid a server/client mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVoiceLanguage(saved as string);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal)
      .then((loaded) => {
        setProducts(loaded);
        setProductsStatus("ready");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setProductsError(
          error instanceof ProductsApiError
            ? error.message
            : "Could not load products. Please try again.",
        );
        setProductsStatus("error");
      });
    return () => controller.abort();
  }, [productsReload]);

  function reloadProducts(): void {
    setProductsStatus("loading");
    setProductsReload((count) => count + 1);
  }

  function changeVoiceLanguage(code: string): void {
    setVoiceLanguage(code);
    window.localStorage.setItem(VOICE_LANGUAGE_KEY, code);
  }

  useEffect(() => {
    if (detailProductId === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetailProductId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [detailProductId]);

  const visibleProducts = products.filter((product) => {
    const query = productQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      [product.name, product.brand, product.description]
        .some((value) => value.toLowerCase().includes(query));
    const matchesCategory =
      activeCategoryFilter === "all" ||
      categoryOf(product) === activeCategoryFilter;
    return matchesQuery && matchesCategory;
  });

  const groupedProducts = new Map<string, Product[]>();
  for (const product of visibleProducts) {
    const category = categoryOf(product);
    groupedProducts.set(category, [
      ...(groupedProducts.get(category) ?? []),
      product,
    ]);
  }

  function openProductDialog(product?: Product): void {
    setEditingProductId(product?.id ?? null);
    setProductForm(
      product
        ? { ...emptyProduct, ...product }
        : emptyProduct,
    );
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
        const created = await createProduct(productForm);
        setProducts((current) => [...current, created]);
      } else {
        const updated = await updateProduct(editingProductId, productForm);
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
        error instanceof ProductsApiError
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
      await deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setDetailProductId((current) => (current === product.id ? null : current));
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
          error instanceof ProductsApiError
            ? error.message
            : "The product could not be deleted. Please try again.",
      });
    } finally {
      setDeletingProductId(null);
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const query = searchText.trim();
    if (!query) {
      setSearchResults(null);
      setSearchMessage("Describe what your customer needs to get started.");
      return;
    }

    // Sample preview only: keyword overlap against the in-memory products,
    // falling back to the first products so the result layout is always visible.
    const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const scored = products.map((product) => {
      const haystack = [
        product.name,
        product.brand,
        product.description,
        product.category,
        product.type,
        product.subType,
        ...product.tags,
        ...product.useCases,
      ]
        .join(" ")
        .toLowerCase();
      const hits = words.filter((word) => haystack.includes(word));
      return { product, hits };
    });
    const matched = scored.filter((item) => item.hits.length > 0);
    const picked = (matched.length > 0 ? matched : scored).slice(0, 3);
    setSearchResults(
      picked.map(({ product, hits }, index) => ({
        product,
        score: Math.max(60, 96 - index * 9),
        reason:
          hits.length > 0
            ? `Sample reasoning: matches your request on "${hits.join('", "')}" in the product details.`
            : `Sample reasoning: shown as an example of how an AI explanation would appear for "${product.name}".`,
      })),
    );
    setSearchMessage(
      "Showing sample results for preview. Product search is not connected to a search service or AI model yet.",
    );
  }

  function submitVoiceQuery(query: string): void {
    setSearchText(query);
    setSearchMessage(
      "Voice transcript placed in Quick Search. Product search is a UI preview and is not connected to a search service yet.",
    );
  }

  return (
    <main className="min-h-screen bg-[#080d1b] px-4 py-7 font-sans text-slate-100 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="relative pb-7 text-center sm:pb-8">
          <div className="absolute right-0 top-0 flex items-center gap-2">
            <div
              aria-label="Voice language"
              className="inline-flex rounded-xl border border-white/[0.08] p-0.5"
              role="group"
            >
              {voiceLanguages.map((option) => (
                <button
                  aria-pressed={voiceLanguage === option.code}
                  className={`rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-cyan-300 ${
                    voiceLanguage === option.code
                      ? "bg-indigo-500/25 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  key={option.code}
                  onClick={() => changeVoiceLanguage(option.code)}
                  title={option.name}
                  type="button"
                >
                  {option.short}
                </button>
              ))}
            </div>
            <LogoutButton />
          </div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            AI Sales Support Hub
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Sales Support Hub
          </h1>
          <p className="mx-auto mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            AI-powered product search, model-aware recommendations, and
            portfolio management—built for fast, customer-ready answers.
          </p>
        </header>

        <nav
          aria-label="Dashboard sections"
          className="mb-6 grid grid-cols-1 gap-1 rounded-2xl border border-white/[0.07] bg-[#0d1425] p-1.5 sm:grid-cols-3"
          role="tablist"
        >
          {tabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                aria-controls={`${tab.id}-panel`}
                aria-selected={selected}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                  selected
                    ? "bg-indigo-400/[0.14] text-indigo-100 ring-1 ring-inset ring-indigo-300/[0.16]"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                }`}
                id={`${tab.id}-tab`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                    return;
                  }

                  event.preventDefault();
                  const currentIndex = tabs.findIndex(
                    (item) => item.id === tab.id,
                  );
                  const direction = event.key === "ArrowRight" ? 1 : -1;
                  const nextTab = tabs[
                    (currentIndex + direction + tabs.length) % tabs.length
                  ];
                  setActiveTab(nextTab.id);
                  document.getElementById(`${nextTab.id}-tab`)?.focus();
                }}
                role="tab"
                tabIndex={selected ? 0 : -1}
                type="button"
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>

        <section
            hidden={activeTab !== "search"}
            aria-labelledby="search-title"
            className="rounded-2xl border border-white/[0.08] bg-[#0d1425] p-5 shadow-xl shadow-black/10 sm:p-7"
            id="search-panel"
            role="tabpanel"
            tabIndex={0}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200">
                <SearchIcon />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-100" id="search-title">
                  AI-Powered Product Search
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Use natural language to find products, select a model for
                  inference, and export results with AI reasoning.
                </p>
              </div>
            </div>

            <form className="mt-6" onSubmit={submitSearch}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div
                  aria-label="Search mode"
                  className="inline-flex w-fit rounded-xl border border-white/[0.07] bg-[#080d1b] p-1"
                  role="group"
                >
                  <button
                    aria-pressed={searchMode === "quick"}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-indigo-300 ${
                      searchMode === "quick"
                        ? "bg-white/[0.08] text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                    onClick={() => setSearchMode("quick")}
                    type="button"
                  >
                    <SearchIcon />
                    Quick Search
                  </button>
                  <button
                    aria-pressed={searchMode === "detailed"}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-indigo-300 ${
                      searchMode === "detailed"
                        ? "bg-white/[0.08] text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                    onClick={() => setSearchMode("detailed")}
                    type="button"
                  >
                    <SparkleIcon />
                    Detailed Search
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-[#080d1b] px-3 text-xs text-slate-400">
                    Model
                    <select
                      className="max-w-[150px] bg-transparent text-xs text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      defaultValue="auto"
                      aria-label="Inference model"
                    >
                      <option value="auto">Auto (default)</option>
                      <option value="balanced">Balanced</option>
                      <option value="precise">High precision</option>
                    </select>
                  </label>
                  <button
                    className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] px-3 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
                    onClick={() =>
                      setSearchMessage("Search history is not connected yet.")
                    }
                    type="button"
                  >
                    <HistoryIcon />
                    History
                    <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-slate-400">
                      2
                    </span>
                  </button>
                  <button
                    className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] px-3 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
                    onClick={() =>
                      setSearchText(
                        "Recommend a reliable, easy-to-maintain solution for a mid-sized laboratory.",
                      )
                    }
                    type="button"
                  >
                    <BookIcon />
                    Templates
                  </button>
                </div>
              </div>

              {searchMode === "quick" && (
                <>
              <label className="sr-only" htmlFor="customer-needs">
                Describe your customer needs
              </label>
              <textarea
                className="mt-5 min-h-20 w-full resize-y rounded-xl border border-white/[0.09] bg-[#080d1b] px-3.5 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                id="customer-needs"
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Describe what your customer needs..."
                value={searchText}
              />
              <button
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                type="submit"
              >
                <SearchIcon />
                Find Products
              </button>
              {searchMessage && (
                <p aria-live="polite" className="mt-3 text-center text-xs text-slate-400" role="status">
                  {searchMessage}
                </p>
              )}
                </>
              )}
            </form>

            {searchMode === "detailed" && (
              <DetailedSearch
                loadError={productsError}
                onOpenProduct={setDetailProductId}
                onRetry={reloadProducts}
                products={products}
                renderThumb={(product) => <ProductThumb product={product} />}
                status={productsStatus}
              />
            )}

            {searchMode === "quick" && searchResults && (
              <section aria-labelledby="search-results-title" className="mt-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-100" id="search-results-title">
                    {searchResults.length} products found{" "}
                    <span className="text-xs font-normal text-slate-500">
                      for “{searchText.trim()}”
                    </span>
                  </h3>
                  <span className="rounded-md bg-amber-400/10 px-2 py-1 text-[11px] font-medium text-amber-200">
                    Sample preview
                  </span>
                </div>
                <ul className="mt-3 space-y-3">
                  {searchResults.map(({ product, score, reason }) => {
                    const stock = /^\d+$/.test(product.stockQuantity.trim())
                      ? Number(product.stockQuantity)
                      : null;
                    return (
                      <li key={product.id}>
                        <button
                          aria-label={`View details for ${product.name}`}
                          className="flex w-full flex-col gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-left transition hover:border-indigo-300/30 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-cyan-300 sm:flex-row sm:items-start"
                          onClick={() => setDetailProductId(product.id)}
                          type="button"
                        >
                          <ProductThumb product={product} />
                          <span className="block min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-slate-100">
                                {product.name}
                              </span>
                              <span className="rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-200">
                                {score}% match (sample)
                              </span>
                            </span>
                            <span className="mt-1 block text-xs text-slate-400">
                              {[product.brand, categoryOf(product), product.type]
                                .filter(Boolean)
                                .join(" · ")}
                              {product.sellingPrice &&
                                ` · ${product.sellingPrice} ${product.currency}`}
                              {stock !== null &&
                                ` · ${stock > 0 ? "In Stock" : "Out of Stock"}`}
                            </span>
                            <span className="mt-2 block rounded-lg border border-cyan-300/10 bg-cyan-400/[0.04] px-3 py-2 text-xs leading-5 text-slate-300">
                              {reason}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {searchMode === "quick" && (
              <VoiceSearch language={voiceLanguage} onSubmitQuery={submitVoiceQuery} />
            )}
        </section>

        <section
            hidden={activeTab !== "products"}
            aria-labelledby="products-title"
            className="rounded-2xl border border-white/[0.08] bg-[#0d1425] p-5 shadow-xl shadow-black/10 sm:p-7"
            id="products-panel"
            role="tabpanel"
            tabIndex={0}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-200">
                  <BoxIcon />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-100" id="products-title">
                    Product Portfolio Management
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Add, edit, and curate your catalog to improve recommendations.
                  </p>
                </div>
              </div>
              <button
                className="flex h-10 items-center justify-center gap-2 self-start rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                onClick={() => openProductDialog()}
                type="button"
              >
                <PlusIcon />
                Add Product
              </button>
            </div>

            <div className="mt-7 flex flex-col gap-3 border-b border-white/[0.07] pb-5 md:flex-row md:items-center">
              <label className="relative block min-w-0 flex-1">
                <span className="sr-only">Search product catalog</span>
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <input
                  className={`${inputClass} pl-10`}
                  onChange={(event) => setProductQuery(event.target.value)}
                  placeholder="Search products by name, brand, or description..."
                  type="search"
                  value={productQuery}
                />
              </label>
              <label className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.08] bg-[#080d1b] px-3 text-xs text-slate-400 md:w-48">
                <FilterIcon />
                <span className="sr-only">Filter by category</span>
                <select
                  className="min-w-0 flex-1 bg-transparent text-xs text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  value={activeCategoryFilter}
                >
                  <option value="all">All Categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-slate-300">
                Product Catalog{" "}
                <span className="text-slate-500">
                  {productsStatus === "ready" &&
                    `(${visibleProducts.length} of ${products.length} products)`}
                </span>
              </p>
              <span className="hidden text-[11px] text-slate-500 sm:block">
                Select a product to view its details
              </span>
            </div>

            <div className="mt-3 space-y-7">
              {[...groupedProducts].map(([category, items]) => (
                <section aria-labelledby={`category-${category}`} key={category}>
                  <h3
                    className="flex items-center gap-2 border-b border-white/[0.06] pb-2 text-sm font-semibold text-slate-100"
                    id={`category-${category}`}
                  >
                    {category}
                    <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[11px] font-medium text-slate-400">
                      {items.length}
                    </span>
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((product) => (
                      <article
                        className="group relative rounded-xl border border-white/[0.07] bg-white/[0.02] transition hover:border-indigo-300/30 hover:bg-white/[0.04]"
                        key={product.id}
                      >
                        <button
                          aria-label={`View details for ${product.name}`}
                          className="flex w-full min-w-0 items-start gap-3 rounded-xl p-3 pr-[5.5rem] text-left focus-visible:outline-2 focus-visible:outline-cyan-300"
                          onClick={() => setDetailProductId(product.id)}
                          type="button"
                        >
                          <ProductThumb product={product} />
                          <span className="block min-w-0">
                            <span className="block truncate text-sm font-medium text-slate-100">
                              {product.name}
                            </span>
                            <span className="mt-1 block truncate text-xs text-slate-400">
                              {[product.brand, product.type, product.subType]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                            <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500">
                              {product.description}
                            </span>
                          </span>
                        </button>
                        <div className="absolute right-2 top-2 flex items-center gap-1.5">
                          <button
                            aria-label={`Edit ${product.name}`}
                            className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300"
                            onClick={() => openProductDialog(product)}
                            type="button"
                          >
                            <EditIcon />
                          </button>
                          <button
                            aria-label={`Delete ${product.name}`}
                            className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 transition hover:border-rose-300/20 hover:bg-rose-400/10 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-rose-300 disabled:opacity-50"
                            disabled={deletingProductId !== null}
                            onClick={() => setConfirmAction({ kind: "delete", product })}
                            type="button"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
              {productsStatus === "loading" && (
                <p className="py-10 text-center text-sm text-slate-400" role="status">
                  Loading products…
                </p>
              )}
              {productsStatus === "error" && (
                <div className="py-10 text-center" role="alert">
                  <p className="text-sm font-medium text-rose-300">
                    Could not load products
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{productsError}</p>
                  <button
                    className="mt-3 h-9 rounded-xl border border-white/[0.1] px-4 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
                    onClick={reloadProducts}
                    type="button"
                  >
                    Retry
                  </button>
                </div>
              )}
              {productsStatus === "ready" && visibleProducts.length === 0 && (
                <div className="py-10 text-center" role="status">
                  <p className="text-sm font-medium text-slate-300">No products found</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {products.length === 0
                      ? "There are no products yet. Add a new product to get started."
                      : "Try a different search or category, or add a new product."}
                  </p>
                </div>
              )}
            </div>
            <p className="mt-4 text-center text-[11px] text-slate-500">
              Changes are a local UI preview and are not saved to a server.
            </p>
        </section>

        <section
            hidden={activeTab !== "analytics"}
            aria-labelledby="analytics-title"
            className="rounded-2xl border border-white/[0.08] bg-[#0d1425] p-5 shadow-xl shadow-black/10 sm:p-7"
            id="analytics-panel"
            role="tabpanel"
            tabIndex={0}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-200">
                <ChartIcon />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-100" id="analytics-title">
                  Analytics Dashboard
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  An overview of product discovery and sales support activity.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <MetricCard label="Searches this week" value="248" change="+12%" />
              <MetricCard label="Products matched" value="186" change="+8.4%" />
              <MetricCard label="Avg. response time" value="1.2s" change="−0.3s" />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-white/[0.07] bg-[#080d1b]/60 p-5">
                <h3 className="text-sm font-medium text-slate-200">
                  Search activity
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Product searches over the past week
                </p>
                <div
                  aria-label="Bar chart showing daily search activity"
                  className="mt-6 flex h-40 items-end justify-between gap-2"
                  role="img"
                >
                  {[42, 64, 52, 86, 70, 100, 76].map((height, index) => (
                    <div
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                      key={index}
                    >
                      <div
                        className="w-full max-w-10 rounded-t-md bg-indigo-400/70"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[10px] text-slate-500">
                        {["M", "T", "W", "T", "F", "S", "S"][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-[#080d1b]/60 p-5">
                <h3 className="text-sm font-medium text-slate-200">
                  Top product categories
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Most frequently matched categories
                </p>
                <div className="mt-6 space-y-5">
                  <CategoryBar label="Laboratory" value={76} />
                  <CategoryBar label="Monitoring" value={58} />
                  <CategoryBar label="Analytics" value={34} />
                </div>
              </div>
            </div>
            <p className="mt-5 text-center text-[11px] text-slate-500">
              Sample dashboard data for preview; analytics are not connected to a data source.
            </p>
        </section>
      </div>

      {detailProduct && (
        <ProductDetailModal
          onClose={() => setDetailProductId(null)}
          onEdit={() => {
            setDetailProductId(null);
            openProductDialog(detailProduct);
          }}
          product={detailProduct}
        />
      )}

      {isProductDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsProductDialogOpen(false);
            }
          }}
        >
          <section
            aria-labelledby="product-dialog-title"
            aria-modal="true"
            className="my-auto w-full max-w-3xl rounded-2xl border border-white/[0.1] bg-[#111a2c] p-5 shadow-2xl shadow-black/40 sm:p-7"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white" id="product-dialog-title">
                  {editingProductId === null ? "Add New Product" : "Edit Product"}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Add a product to your catalog
                </p>
              </div>
              <button
                aria-label="Close dialog"
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300"
                onClick={() => setIsProductDialogOpen(false)}
                type="button"
              >
                <CloseIcon />
              </button>
            </div>

            <form className="mt-5 space-y-4" noValidate onSubmit={saveProduct}>
              <ProductFormFields
                errors={productErrors}
                onChange={setProductForm}
                showAllErrors={showProductErrors}
                values={productForm}
              />

              {productMessage && (
                <p className="text-xs text-rose-300" role="alert">
                  {productMessage}
                </p>
              )}
              <p className="text-[11px] text-slate-500">
                Changes are saved to the product database when you confirm.
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  className="h-10 rounded-xl border border-white/[0.1] px-4 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
                  onClick={() => setIsProductDialogOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="h-10 rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:opacity-60"
                  disabled={isSavingProduct}
                  type="submit"
                >
                  {isSavingProduct
                    ? "Saving…"
                    : editingProductId === null
                      ? "Create Product"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {confirmAction && (
        <PopupDialog
          actions={
            <>
              <button
                className="h-10 rounded-xl border border-white/[0.1] px-4 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
                onClick={() => setConfirmAction(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                autoFocus
                className={`h-10 rounded-xl px-4 text-xs font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                  confirmAction.kind === "delete"
                    ? "bg-rose-500 hover:bg-rose-400"
                    : "bg-indigo-500 hover:bg-indigo-400"
                }`}
                onClick={() =>
                  confirmAction.kind === "delete"
                    ? void removeProduct(confirmAction.product)
                    : void persistProduct()
                }
                type="button"
              >
                {confirmAction.kind === "delete" ? "Delete" : "Update"}
              </button>
            </>
          }
          message={
            confirmAction.kind === "delete"
              ? `Delete "${confirmAction.product.name}"? This cannot be undone.`
              : `Save your changes to "${productForm.name.trim()}"?`
          }
          onClose={() => setConfirmAction(null)}
          title={
            confirmAction.kind === "delete" ? "Confirm delete" : "Confirm update"
          }
          tone={confirmAction.kind === "delete" ? "error" : "info"}
        />
      )}
      {notice && (
        <PopupDialog
          actions={
            <button
              autoFocus
              className="h-10 rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              onClick={() => setNotice(null)}
              type="button"
            >
              OK
            </button>
          }
          message={notice.message}
          onClose={() => setNotice(null)}
          title={notice.title}
          tone={notice.tone}
        />
      )}
    </main>
  );
}

function PopupDialog({
  title,
  message,
  tone,
  actions,
  onClose,
}: {
  title: string;
  message: string;
  tone: "success" | "error" | "info";
  actions: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const accent =
    tone === "success"
      ? "text-emerald-300"
      : tone === "error"
        ? "text-rose-300"
        : "text-indigo-300";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-describedby="popup-message"
        aria-labelledby="popup-title"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#111a2c] p-6 text-center shadow-2xl shadow-black/40"
        role="alertdialog"
      >
        <h2 className={`text-base font-semibold ${accent}`} id="popup-title">
          {title}
        </h2>
        <p className="mt-2 break-words text-sm text-slate-300" id="popup-message">
          {message}
        </p>
        <div className="mt-5 flex justify-center gap-2">{actions}</div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <article className="rounded-xl border border-white/[0.07] bg-[#080d1b]/60 px-4 py-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
        <span className="rounded-md bg-emerald-400/[0.09] px-2 py-1 text-[11px] font-medium text-emerald-300">
          {change}
        </span>
      </div>
    </article>
  );
}

function CategoryBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-500">{value}%</span>
      </div>
      <div
        aria-label={`${label}: ${value}%`}
        className="h-2 overflow-hidden rounded-full bg-white/[0.06]"
        role="img"
      >
        <div
          className="h-full rounded-full bg-cyan-400/70"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function SearchIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" strokeWidth="1.7" />
      <path d="m15.5 15.5 4.2 4.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function ProductThumb({
  product,
  large = false,
}: {
  product: Product;
  large?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState("");
  const url = product.imageUrl.trim();
  const showImage = Boolean(url) && failedUrl !== url;
  const size = large
    ? showImage
      ? "w-full"
      : "h-40 w-full"
    : "size-12 shrink-0";
  const visual = placeholderVisual(product);

  return (
    <span
      className={`relative flex ${size} items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] ${
        showImage
          ? "bg-[#080d1b]"
          : `bg-gradient-to-br ${visual.gradient} text-white/85`
      }`}
    >
      {showImage ? (
        // Arbitrary user-supplied remote URL, so next/image is not suitable.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`${product.name} image`}
          className={
            large
              ? "block h-auto max-h-[60vh] w-auto max-w-full object-contain"
              : "size-full object-contain"
          }
          onError={() => setFailedUrl(url)}
          src={url}
        />
      ) : (
        <span
          aria-label={`${visual.label} placeholder`}
          className="flex size-full items-center justify-center"
          role="img"
        >
          <svg
            aria-hidden="true"
            className={large ? "size-16" : "size-6"}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
            viewBox="0 0 24 24"
          >
            {visual.icon}
          </svg>
        </span>
      )}
    </span>
  );
}

function placeholderVisual(product: Product): {
  label: string;
  gradient: string;
  icon: ReactNode;
} {
  const text = `${product.category} ${product.type} ${product.subType}`.toLowerCase();
  if (/lab|chromat|analy|hplc|science/.test(text)) {
    return {
      label: "Laboratory",
      gradient: "from-violet-500/40 via-indigo-500/25 to-cyan-500/25",
      icon: (
        <>
          <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" />
          <path d="M7.5 15h9" />
        </>
      ),
    };
  }
  if (/monitor|sensor|environment|air|quality/.test(text)) {
    return {
      label: "Monitoring",
      gradient: "from-emerald-500/35 via-teal-500/25 to-sky-500/25",
      icon: (
        <>
          <circle cx="12" cy="12" r="2" />
          <path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4" />
          <path d="M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5" />
        </>
      ),
    };
  }
  if (/computer|laptop|desktop|pc/.test(text)) {
    return {
      label: "Computer",
      gradient: "from-sky-500/35 via-indigo-500/25 to-blue-500/25",
      icon: (
        <>
          <rect height="12" rx="1.5" width="16" x="4" y="5" />
          <path d="M2 19h20" />
        </>
      ),
    };
  }
  if (/network|router|switch/.test(text)) {
    return {
      label: "Networking",
      gradient: "from-cyan-500/35 via-blue-500/25 to-indigo-500/25",
      icon: (
        <>
          <rect height="6" rx="1.5" width="18" x="3" y="14" />
          <path d="M7 14v-3M12 14V8M17 14v-3M7 17h.01M11 17h.01" />
        </>
      ),
    };
  }
  return {
    label: "Product",
    gradient: "from-slate-500/30 via-indigo-500/15 to-slate-600/20",
    icon: (
      <>
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      </>
    ),
  };
}

function ProductDetailModal({
  product,
  onClose,
  onEdit,
}: {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
}) {
  const stock = /^\d+$/.test(product.stockQuantity.trim())
    ? Number(product.stockQuantity)
    : null;
  const availability = product.discontinued
    ? "Discontinued"
    : stock === null
      ? "Not specified"
      : stock > 0
        ? `In Stock (${stock})`
        : "Out of Stock";
  const specs = product.specifications.filter((spec) => spec.key.trim());
  const features = product.features.split("\n").map((f) => f.trim()).filter(Boolean);

  const rows: [string, string][] = [
    ["Brand", product.brand],
    ["Model", product.model],
    ["SKU", product.sku],
    [
      "Category",
      [categoryOf(product), product.type, product.subType]
        .filter(Boolean)
        .join(" › "),
    ],
    [
      "Price",
      product.sellingPrice
        ? `${product.sellingPrice} ${product.currency}`
        : "",
    ],
    ["Availability", availability],
    [
      "Warranty",
      product.warrantyMonths ? `${product.warrantyMonths} months` : "",
    ],
  ];

  const lists: [string, string[]][] = [
    ["Tags", product.tags],
    ["Target customers", product.targetCustomers],
    ["Use cases", product.useCases],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="product-detail-title"
        aria-modal="true"
        className="my-auto w-full max-w-2xl rounded-2xl border border-white/[0.1] bg-[#111a2c] p-5 shadow-2xl shadow-black/40 sm:p-7"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-white" id="product-detail-title">
            {product.name}
          </h2>
          <button
            aria-label="Close dialog"
            autoFocus
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300"
            onClick={onClose}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-4">
          <ProductThumb large product={product} />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">{product.description}</p>

        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {rows
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] text-slate-500">{label}</dt>
                <dd className="text-sm text-slate-200">{value}</dd>
              </div>
            ))}
        </dl>

        {specs.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-slate-300">Specifications</h3>
            <dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {specs.map((spec, index) => (
                <div key={`${spec.key}-${index}`}>
                  <dt className="text-[11px] text-slate-500">{spec.key}</dt>
                  <dd className="text-sm text-slate-200">{spec.value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {features.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-slate-300">Features</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
              {features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {lists.map(
          ([label, values]) =>
            values.length > 0 && (
              <div className="mt-4" key={label}>
                <h3 className="text-xs font-semibold text-slate-300">{label}</h3>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {values.map((value) => (
                    <li
                      className="rounded-lg bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100"
                      key={value}
                    >
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            ),
        )}

        {[
          ["Key benefits", product.keyBenefits],
          ["Limitations", product.limitations],
        ].map(
          ([label, value]) =>
            value.trim() && (
              <div className="mt-4" key={label}>
                <h3 className="text-xs font-semibold text-slate-300">{label}</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-200">{value}</p>
              </div>
            ),
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="h-10 rounded-xl border border-white/[0.1] px-4 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
          <button
            className="h-10 rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            onClick={onEdit}
            type="button"
          >
            Edit Product
          </button>
        </div>
      </section>
    </div>
  );
}

function BoxIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path
        d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="m4.5 7.75 7.5 4.3 7.5-4.3M12 12v8.5"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="M4 20V4m0 16h17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
      <rect height="7" rx="1" stroke="currentColor" strokeWidth="1.6" width="3.5" x="7" y="10" />
      <rect height="11" rx="1" stroke="currentColor" strokeWidth="1.6" width="3.5" x="13" y="6" />
      <rect height="4" rx="1" stroke="currentColor" strokeWidth="1.6" width="3.5" x="19" y="13" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="m12 3 1.7 6.3L20 11l-6.3 1.7L12 19l-1.7-6.3L4 11l6.3-1.7L12 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" fill="currentColor" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="M4.5 8V3.5m0 0H9m-4.5 0 3 3A8 8 0 1 1 4 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
      <path d="M4 18a2.5 2.5 0 0 1 2.5-2.5H20" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" className="size-4 shrink-0" fill="none" viewBox="0 0 24 24">
      <path d="M4 5h16l-6.5 7.5v5l-3 1.5v-6.5L4 5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="m14 5 5 5M4 20l4.3-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="M4 7h16m-10 4v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}
