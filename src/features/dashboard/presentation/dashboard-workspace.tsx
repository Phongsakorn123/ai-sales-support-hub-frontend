"use client";

import LogoutButton from "@/features/auth/presentation/components/logout-button";
import ProductEditorDialog from "@/features/products/presentation/components/product-editor-dialog";
import DashboardFeedbackDialogs from "@/features/dashboard/presentation/components/dashboard-feedback-dialogs";
import { ProductDetailModal } from "@/features/dashboard/presentation/components/product-detail-modal";
import SearchPanel from "@/features/dashboard/presentation/components/search-panel";
import ProductsPanel from "@/features/dashboard/presentation/components/products-panel";
import AnalyticsPanel from "@/features/dashboard/presentation/components/analytics-panel";
import useDashboardViewModel from "@/features/dashboard/presentation/view-models/dashboard-view-model";
import DashboardNavigation from "@/features/dashboard/presentation/navigation/dashboard-navigation";

const voiceLanguages = [
  { code: "th-TH", short: "TH", name: "ไทย (Thai)" },
  { code: "en-US", short: "EN", name: "English" },
];
export default function DashboardWorkspace() {
  const state = useDashboardViewModel();
  const {
    activeTab, products, productsStatus, productsError, reloadProducts,
    searchMode, setSearchMode, searchText, setSearchText, searchMessage, setSearchMessage,
    productQuery, setProductQuery, setCategoryFilter, isProductDialogOpen, setIsProductDialogOpen,
    editingProductId, productForm, setProductForm, productMessage, isSavingProduct,
    deletingProductId, confirmAction, setConfirmAction, notice, setNotice, showProductErrors,
    suggestion, setSuggestion, quickMaxProducts, setQuickMaxProducts, quickIncludeOos,
    setQuickIncludeOos, voiceLanguage, setDetailProductId, productErrors,
    categoryOptions, activeCategoryFilter, detailProduct, activeProducts, stockUnits,
    inventoryValueByCurrency, productCategories, visibleProducts, groupedProducts,
    productDocuments, productDocumentsStatus, productDocumentsError,
    reloadProductDocuments,
    changeVoiceLanguage, openProductDialog, saveProduct, persistProduct, removeProduct,
    runSuggestion, submitSearch, retrySearch, submitVoiceQuery,
  } = state;


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

        <DashboardNavigation activeTab={activeTab} />

        <SearchPanel active={activeTab === "search"} searchMode={searchMode} setSearchMode={setSearchMode} searchText={searchText} setSearchText={setSearchText} searchMessage={searchMessage} setSearchMessage={setSearchMessage} quickMaxProducts={quickMaxProducts} setQuickMaxProducts={setQuickMaxProducts} quickIncludeOos={quickIncludeOos} setQuickIncludeOos={setQuickIncludeOos} suggestion={suggestion} products={products} runSuggestion={runSuggestion} retrySearch={retrySearch} submitSearch={submitSearch} onResetSearch={() => setSuggestion({ status: "idle" })} voiceLanguage={voiceLanguage} submitVoiceQuery={submitVoiceQuery} />
        <ProductsPanel active={activeTab === "products"} products={products} productsStatus={productsStatus} productsError={productsError} visibleProducts={visibleProducts} groupedProducts={groupedProducts} categoryOptions={categoryOptions} activeCategoryFilter={activeCategoryFilter} setCategoryFilter={setCategoryFilter} productQuery={productQuery} setProductQuery={setProductQuery} openProductDialog={openProductDialog} deletingProductId={deletingProductId} setDetailProductId={setDetailProductId} setConfirmAction={setConfirmAction} reloadProducts={reloadProducts} />
        <AnalyticsPanel active={activeTab === "analytics"} products={products} productsStatus={productsStatus} productsError={productsError} reloadProducts={reloadProducts} activeProducts={activeProducts} stockUnits={stockUnits} inventoryValueByCurrency={inventoryValueByCurrency} productCategories={productCategories} />
      </div>

      {detailProduct && (
        <ProductDetailModal
          onClose={() => setDetailProductId(null)}
          onEdit={() => {
            setDetailProductId(null);
            openProductDialog(detailProduct);
          }}
          product={detailProduct}
          documents={productDocuments}
          documentsStatus={productDocumentsStatus}
          documentsError={productDocumentsError}
          onRetryDocuments={reloadProductDocuments}
        />
      )}

      <ProductEditorDialog isOpen={isProductDialogOpen} productId={editingProductId} values={productForm} errors={productErrors} showAllErrors={showProductErrors} message={productMessage} isSaving={isSavingProduct} onClose={() => setIsProductDialogOpen(false)} onChange={setProductForm} onSave={saveProduct} />
      <DashboardFeedbackDialogs
        searching={suggestion.status === "loading"}
        confirmAction={confirmAction}
        notice={notice}
        productName={productForm.name.trim()}
        onCloseConfirm={() => setConfirmAction(null)}
        onConfirm={(action) => action.kind === "delete" ? void removeProduct(action.product) : void persistProduct()}
        onCloseNotice={() => setNotice(null)}
      />
    </main>
  );
}
