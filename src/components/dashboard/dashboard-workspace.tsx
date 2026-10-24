"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import VoiceSearch from "@/components/dashboard/voice-search";
import LogoutButton from "@/features/auth/presentation/components/logout-button";

type DashboardTab = "search" | "products" | "analytics";

interface Product {
  id: number;
  name: string;
  brand: string;
  description: string;
  imageUrl: string;
  category: string;
  type: string;
  subType: string;
}

interface ProductFormValues {
  name: string;
  brand: string;
  description: string;
  imageUrl: string;
  category: string;
  type: string;
  subType: string;
}

const tabs: { id: DashboardTab; label: string; icon: ReactNode }[] = [
  { id: "search", label: "Product Search", icon: <SearchIcon /> },
  { id: "products", label: "Manage Products", icon: <BoxIcon /> },
  { id: "analytics", label: "Analytics Dashboard", icon: <ChartIcon /> },
];

const initialProducts: Product[] = [
  {
    id: 1,
    name: "DynaChrom system",
    brand: "ThermoFisher",
    description: "High-performance chromatography system for laboratories.",
    imageUrl: "",
    category: "Laboratory",
    type: "Chromatography",
    subType: "HPLC",
  },
  {
    id: 2,
    name: "AeroSense Monitor",
    brand: "Northstar",
    description: "Continuous air-quality monitoring for commercial spaces.",
    imageUrl: "",
    category: "Monitoring",
    type: "Environment",
    subType: "Air quality",
  },
  {
    id: 3,
    name: "Vertex Pro Analyzer",
    brand: "Vertex",
    description: "Compact analyzer designed for fast, accurate results.",
    imageUrl: "",
    category: "Laboratory",
    type: "Analyzer",
    subType: "Portable",
  },
];

const emptyProduct: ProductFormValues = {
  name: "",
  brand: "",
  description: "",
  imageUrl: "",
  category: "",
  type: "",
  subType: "",
};

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-[#080d1b] px-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10";
const labelClass = "mb-2 block text-xs font-medium text-slate-300";

export default function DashboardWorkspace() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("search");
  const [products, setProducts] = useState(initialProducts);
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

  const visibleProducts = products.filter((product) => {
    const query = productQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      [product.name, product.brand, product.description]
        .some((value) => value.toLowerCase().includes(query));
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  function openProductDialog(product?: Product): void {
    setEditingProductId(product?.id ?? null);
    setProductForm(
      product
        ? {
            name: product.name,
            brand: product.brand,
            description: product.description,
            imageUrl: product.imageUrl,
            category: product.category,
            type: product.type,
            subType: product.subType,
          }
        : emptyProduct,
    );
    setProductMessage("");
    setIsProductDialogOpen(true);
  }

  function saveProduct(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (productForm.description.trim().length < 10) {
      setProductMessage("Description must contain at least 10 characters.");
      return;
    }

    if (editingProductId === null) {
      setProducts((current) => [
        ...current,
        { ...productForm, id: Date.now() },
      ]);
    } else {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingProductId
            ? { ...product, ...productForm }
            : product,
        ),
      );
    }
    setIsProductDialogOpen(false);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSearchMessage(
      searchText.trim()
        ? "Product search is a UI preview and is not connected to a search service yet."
        : "Describe what your customer needs to get started.",
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
          <div className="absolute right-0 top-0">
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
            </form>

            <VoiceSearch onSubmitQuery={submitVoiceQuery} />
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
                  value={categoryFilter}
                >
                  <option value="all">All Categories</option>
                  {[...new Set(products.map((product) => product.category))].map(
                    (category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-slate-300">
                Product Catalog{" "}
                <span className="text-slate-500">
                  ({visibleProducts.length} of {products.length} products)
                </span>
              </p>
              <span className="hidden text-[11px] text-slate-500 sm:block">
                Select a product to edit or remove it
              </span>
            </div>

            <div className="mt-3 divide-y divide-white/[0.06]">
              {visibleProducts.map((product) => (
                <article
                  className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  key={product.id}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-indigo-200">
                      <BoxIcon />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium text-slate-100">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {product.brand} · {product.category} · {product.type}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {product.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                    <button
                      aria-label={`Edit ${product.name}`}
                      className="flex size-9 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300"
                      onClick={() => openProductDialog(product)}
                      type="button"
                    >
                      <EditIcon />
                    </button>
                    <button
                      aria-label={`Delete ${product.name}`}
                      className="flex size-9 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 transition hover:border-rose-300/20 hover:bg-rose-400/10 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-rose-300"
                      onClick={() =>
                        setProducts((current) =>
                          current.filter((item) => item.id !== product.id),
                        )
                      }
                      type="button"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </article>
              ))}
              {visibleProducts.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-400">
                  No products match your search.
                </p>
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
            className="my-auto w-full max-w-xl rounded-2xl border border-white/[0.1] bg-[#111a2c] p-5 shadow-2xl shadow-black/40 sm:p-7"
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

            <form className="mt-5 space-y-4" onSubmit={saveProduct}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Product Name *</span>
                  <input
                    autoFocus
                    className={inputClass}
                    onChange={(event) =>
                      setProductForm((form) => ({
                        ...form,
                        name: event.target.value,
                      }))
                    }
                    required
                    value={productForm.name}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Brand *</span>
                  <input
                    className={inputClass}
                    onChange={(event) =>
                      setProductForm((form) => ({
                        ...form,
                        brand: event.target.value,
                      }))
                    }
                    required
                    value={productForm.brand}
                  />
                </label>
              </div>

              <label className="block">
                <span className={labelClass}>
                  Description * (minimum 10 characters)
                </span>
                <textarea
                  className="min-h-20 w-full resize-y rounded-xl border border-white/10 bg-[#080d1b] px-3.5 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                  maxLength={1000}
                  minLength={10}
                  onChange={(event) =>
                    setProductForm((form) => ({
                      ...form,
                      description: event.target.value,
                    }))
                  }
                  required
                  value={productForm.description}
                />
                <span className="mt-1 block text-[11px] text-slate-500">
                  {productForm.description.length} characters
                </span>
              </label>

              <label className="block">
                <span className={labelClass}>Image URL *</span>
                <input
                  className={inputClass}
                  onChange={(event) =>
                    setProductForm((form) => ({
                      ...form,
                      imageUrl: event.target.value,
                    }))
                  }
                  required
                  type="url"
                  value={productForm.imageUrl}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                {(
                  [
                    ["category", "Category *"],
                    ["type", "Type *"],
                    ["subType", "Sub Type *"],
                  ] as const
                ).map(([field, label]) => (
                  <label className="block" key={field}>
                    <span className={labelClass}>{label}</span>
                    <input
                      className={inputClass}
                      onChange={(event) =>
                        setProductForm((form) => ({
                          ...form,
                          [field]: event.target.value,
                        }))
                      }
                      required
                      value={productForm[field]}
                    />
                  </label>
                ))}
              </div>

              {productMessage && (
                <p className="text-xs text-rose-300" role="alert">
                  {productMessage}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  className="h-10 rounded-xl border border-white/[0.1] px-4 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
                  onClick={() => setIsProductDialogOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="h-10 rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  type="submit"
                >
                  {editingProductId === null ? "Create Product" : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
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
