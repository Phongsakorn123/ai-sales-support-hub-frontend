import { Field, TagInput, customerSuggestions, useCaseSuggestions, textareaClass, sectionClass, sectionTitleClass } from "@/features/products/presentation/components/product-form-controls";
import type { FieldProps } from "@/features/products/presentation/components/product-form-section-types";

export default function RecommendationFields({ values, set }: FieldProps) {
  return (
<details className={`group ${sectionClass}`}>
        <summary
          className={`${sectionTitleClass} flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden`}
        >
          <span
            aria-hidden="true"
            className="text-slate-500 transition-transform group-open:rotate-90"
          >
            ›
          </span>
          AI Recommendation Context{" "}
          <span className="text-[11px] font-normal text-slate-500">
            (optional)
          </span>
        </summary>
        <div className="mt-4 space-y-4">
          <p className="text-[11px] text-slate-500">
            Helps describe who this product suits. These details are stored with
            the product form only; AI recommendations are not connected yet.
          </p>
          <TagInput
            label="Target Customer"
            onChange={(v) => set("targetCustomers", v)}
            placeholder="e.g. SME"
            suggestions={customerSuggestions}
            values={values.targetCustomers}
          />
          <TagInput
            label="Use Cases"
            onChange={(v) => set("useCases", v)}
            placeholder="e.g. Video Conferencing"
            suggestions={useCaseSuggestions}
            values={values.useCases}
          />
          <Field label="Key Benefits">
            <textarea
              className={textareaClass}
              onChange={(e) => set("keyBenefits", e.target.value)}
              placeholder="Main benefits for the customer"
              value={values.keyBenefits}
            />
          </Field>
          <Field
            helper="Optional: constraints or unsuitable use cases."
            label="Limitations"
          >
            <textarea
              className={textareaClass}
              onChange={(e) => set("limitations", e.target.value)}
              placeholder="e.g. Not suited for heavy 3D rendering"
              value={values.limitations}
            />
          </Field>
        </div>
      </details>
  );
}
