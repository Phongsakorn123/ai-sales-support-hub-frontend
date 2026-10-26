import type {
  MatchType,
  Recommendation,
  SuggestionResult,
} from "@/lib/api/product-suggestions-core";

export type SuggestionState =
  | { status: "idle" }
  | { status: "loading"; requirements: string }
  | { status: "error"; requirements: string; message: string }
  | { status: "success"; requirements: string; result: SuggestionResult };

const matchLabels: Record<MatchType, { label: string; className: string }> = {
  exact_match: {
    label: "Exact match",
    className: "bg-emerald-400/10 text-emerald-200",
  },
  alternative: {
    label: "Alternative",
    className: "bg-amber-400/10 text-amber-200",
  },
  insufficient_data: {
    label: "Insufficient data",
    className: "bg-slate-400/10 text-slate-300",
  },
};

function RequirementList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p
        className={`text-[11px] font-semibold uppercase tracking-wide ${tone}`}
      >
        {title}
      </p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-300">
        {items.map((item, index) => (
          <li className="break-words" key={`${index}-${item}`}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecommendationCard({ item }: { item: Recommendation }) {
  const match = matchLabels[item.matchType];
  return (
    <li className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="min-w-0 break-words text-sm font-semibold text-slate-100">
          {item.name}
        </h4>
        <span
          className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${match.className}`}
        >
          {match.label}
        </span>
      </div>
      <p className="mt-1 break-words text-xs text-slate-400">
        {[item.brand, item.category, item.sku].filter(Boolean).join(" · ")}
      </p>
      <p className="mt-1 text-xs text-slate-300">
        {item.sellingPrice && `${item.sellingPrice} ${item.currency}`}
        {" · "}
        <span className={item.inStock ? "text-emerald-300" : "text-rose-300"}>
          {item.inStock ? `In stock (${item.stockQuantity})` : "Out of stock"}
        </span>
      </p>

      {item.reasons.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-lg border border-cyan-300/10 bg-cyan-400/[0.04] px-3 py-2 text-xs leading-5 text-slate-300">
          {item.reasons.map((reason, index) => (
            <li className="break-words" key={`${index}-${reason}`}>
              {reason}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <RequirementList
          items={item.satisfiedRequirements}
          title="Satisfied"
          tone="text-emerald-300"
        />
        <RequirementList
          items={item.unmetRequirements}
          title="Not met"
          tone="text-rose-300"
        />
        <RequirementList
          items={item.unverifiedRequirements}
          title="Unverified"
          tone="text-slate-400"
        />
      </div>

      {item.followUpQuestion && (
        <p className="mt-3 rounded-lg bg-indigo-400/[0.08] px-3 py-2 text-xs text-indigo-100">
          <span className="font-semibold">Ask the customer: </span>
          {item.followUpQuestion}
        </p>
      )}

      {item.supportingDocuments.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Supporting documents
          </p>
          <ul className="mt-1 space-y-1 text-xs text-slate-300">
            {item.supportingDocuments.map((doc) => (
              <li className="break-words" key={doc.documentId}>
                {/^https?:\/\//.test(doc.fileUrl) ? (
                  <a
                    className="text-cyan-300 underline-offset-2 hover:underline"
                    href={doc.fileUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {doc.title}
                  </a>
                ) : (
                  doc.title
                )}
                {doc.documentType && ` · ${doc.documentType}`}
                {doc.isMock && (
                  <span className="ml-1.5 rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] text-amber-200">
                    Demo data
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export default function SuggestionResults({
  state,
  onRetry,
  onUseDetailSearch,
}: {
  state: SuggestionState;
  onRetry: () => void;
  onUseDetailSearch: () => void;
}) {
  if (state.status === "idle") return null;

  return (
    <section
      aria-labelledby="ai-results-title"
      className="mt-6"
      id="ai-results"
    >
      <h3 className="sr-only" id="ai-results-title">
        Search results
      </h3>
      <p className="break-words rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
        <span className="font-medium text-slate-300">Your request: </span>
        {state.requirements}
      </p>

      {state.status === "loading" && (
        <p className="py-8 text-center text-sm text-slate-400" role="status">
          Finding suitable products…
        </p>
      )}

      {state.status === "error" && (
        <div className="py-8 text-center" role="alert">
          <p className="text-sm font-medium text-rose-300">Search failed</p>
          <p className="mt-1 text-xs text-slate-400">{state.message}</p>
          <button
            className="mt-3 h-9 rounded-lg border border-white/[0.1] px-4 text-xs text-slate-300 hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
        </div>
      )}

      {state.status === "success" && (
        <div aria-live="polite" className="mt-3 space-y-3">
          {state.result.rankingSource === "catalog_fallback" && (
            <p className="rounded-lg border border-sky-300/15 bg-sky-400/[0.06] px-3 py-2 text-xs text-sky-100">
              AI ranking is currently unavailable. These products were selected
              using catalog matching rules.
            </p>
          )}
          {state.result.retrievalMode === "keyword_fallback" && (
            <p className="rounded-lg border border-amber-300/15 bg-amber-400/[0.06] px-3 py-2 text-xs text-amber-100">
              Semantic retrieval is unavailable for this search. Results use
              keyword matching only.
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-100">
              {state.result.recommendations.length}{" "}
              {state.result.recommendations.length === 1
                ? "product"
                : "products"}{" "}
              returned
            </h4>
            {state.result.exactMatchCount !== null && (
              <span className="text-xs text-slate-300">
                {state.result.exactMatchCount} exact{" "}
                {state.result.exactMatchCount === 1 ? "match" : "matches"}{" "}
                found.
              </span>
            )}
          </div>
          {state.result.summary && (
            <p className="break-words text-xs leading-5 text-slate-300">
              {state.result.summary}
            </p>
          )}

          {state.result.recommendations.length === 0 ? (
            <div className="rounded-xl border border-white/[0.07] px-4 py-6 text-center">
              <p className="text-sm text-slate-300">
                No suitable products were returned for these requirements.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try rewording the request, or use Detailed Search to specify
                category, brand, budget and RAM.
              </p>
              <button
                className="mt-3 h-9 rounded-lg border border-white/[0.1] px-4 text-xs text-slate-300 hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
                onClick={onUseDetailSearch}
                type="button"
              >
                Open Detailed Search
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {state.result.recommendations.map((item) => (
                <RecommendationCard item={item} key={item.productId} />
              ))}
            </ul>
          )}

          {state.result.limitations.length > 0 && (
            <ul className="list-disc space-y-0.5 pl-4 text-xs text-slate-500">
              {state.result.limitations.map((limitation, index) => (
                <li className="break-words" key={`${index}-${limitation}`}>
                  {limitation}
                </li>
              ))}
            </ul>
          )}
          {state.result.disclaimer && (
            <p className="text-[11px] text-slate-500">
              {state.result.disclaimer}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
