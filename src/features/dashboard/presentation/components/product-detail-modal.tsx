import { CloseIcon } from "@/features/dashboard/presentation/components/dashboard-icons";
import { ProductThumb } from "@/features/dashboard/presentation/components/product-visual";
import type { Product, ProductDocument } from "@/features/products/domain/product";

const documentTypeLabels: Record<string, string> = {
  product_manual: "Product manual",
  publication: "Publication",
  datasheet: "Datasheet / publication",
  valuation_report: "Price / market analysis",
};

export function ProductDetailModal({
  product,
  documents,
  documentsStatus,
  documentsError,
  onRetryDocuments,
  onClose,
  onEdit,
}: {
  product: Product;
  documents: ProductDocument[];
  documentsStatus: "idle" | "loading" | "ready" | "error";
  documentsError: string;
  onRetryDocuments: () => void;
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
  const features = product.features
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  const rows: [string, string][] = [
    ["Brand", product.brand],
    ["Model", product.model],
    ["SKU", product.sku],
    [
      "Category",
      [(product.category.trim() || "Uncategorized"), product.type, product.subType]
        .filter(Boolean)
        .join(" › "),
    ],
    [
      "Price",
      product.sellingPrice ? `${product.sellingPrice} ${product.currency}` : "",
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
          <h2
            className="text-lg font-semibold text-white"
            id="product-detail-title"
          >
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
        <p className="mt-4 text-sm leading-6 text-slate-300">
          {product.description}
        </p>

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
            <h3 className="text-xs font-semibold text-slate-300">
              Specifications
            </h3>
            <dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {specs.map((spec, index) => (
                <div key={`${spec.key}-${index}`}>
                  <dt className="text-[11px] text-slate-500">{spec.key}</dt>
                  <dd className="text-sm text-slate-200">
                    {spec.value || "—"}
                  </dd>
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
                <h3 className="text-xs font-semibold text-slate-300">
                  {label}
                </h3>
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
                <h3 className="text-xs font-semibold text-slate-300">
                  {label}
                </h3>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-200">
                  {value}
                </p>
              </div>
            ),
        )}

        <section
          aria-labelledby="product-documents-title"
          className="mt-5 border-t border-white/[0.08] pt-4"
        >
          <h3
            className="text-xs font-semibold text-slate-300"
            id="product-documents-title"
          >
            Related documents
          </h3>
          {documentsStatus === "loading" && (
            <p className="mt-2 text-xs text-slate-400" role="status">
              Loading product documents…
            </p>
          )}
          {documentsStatus === "error" && (
            <div className="mt-2 flex items-center justify-between gap-3" role="alert">
              <p className="text-xs text-rose-200">{documentsError}</p>
              <button
                className="shrink-0 rounded-lg border border-white/[0.1] px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/[0.05]"
                onClick={onRetryDocuments}
                type="button"
              >
                Retry
              </button>
            </div>
          )}
          {documentsStatus === "ready" && documents.length === 0 && (
            <p className="mt-2 text-xs text-slate-400">
              No external documents are available for this product.
            </p>
          )}
          {documents.length > 0 && (
            <ul className="mt-2 space-y-2">
              {documents.map((document) => (
                <li
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2"
                  key={document.id}
                >
                  <a
                    aria-label={`Open ${document.title} from ${document.sourceName ?? "external source"}`}
                    className="text-sm font-medium text-cyan-200 underline-offset-2 hover:underline"
                    href={document.sourceUrl ?? undefined}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {document.title}
                  </a>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                    {document.sourceName && <span>{document.sourceName}</span>}
                    {document.documentType && (
                      <span>
                        {documentTypeLabels[document.documentType] ??
                          document.documentType}
                      </span>
                    )}
                    <span className="text-cyan-200">External source</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
          {documentsStatus === "ready" && (
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              External links can open publisher pages or live search results. Verify
              the model and region before sharing.
            </p>
          )}
        </section>

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
