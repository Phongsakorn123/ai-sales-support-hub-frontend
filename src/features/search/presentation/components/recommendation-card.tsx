import type { MatchType, Recommendation } from "@/features/search/domain/search-types";

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

export default function RecommendationCard({ item }: { item: Recommendation }) {
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
