import { useState, type ReactNode } from "react";
import type { Product } from "@/features/products/domain/product";
import { productImageUrl } from "@/features/products/presentation/utils/product-image-url";

export function ProductThumb({
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
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`${product.name} image`}
          className={
            large
              ? "block h-auto max-h-[60vh] w-auto max-w-full object-contain"
              : "size-full object-contain"
          }
          onError={() => setFailedUrl(url)}
          src={productImageUrl(url)}
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
  const text =
    `${product.category} ${product.type} ${product.subType}`.toLowerCase();
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
