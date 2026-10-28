import type { ProductSpec } from "@/features/products/domain/product";
import { Field, TagInput, specKeySuggestions, inputClass, numberClass, textareaClass, labelClass, sectionClass, sectionTitleClass } from "@/features/products/presentation/components/product-form-controls";
import type { FieldProps } from "@/features/products/presentation/components/product-form-section-types";

type Props = FieldProps & { updateSpec: (index: number, patch: Partial<ProductSpec>) => void };

export default function TechnicalFields(props: Props) {
  const { values, set, err, bind, updateSpec } = props;
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
          Technical Specifications{" "}
          <span className="text-[11px] font-normal text-slate-500">
            (optional)
          </span>
        </summary>
        <div className="mt-4 space-y-4">
          <div>
            <span className={labelClass}>Specifications</span>
            <div className="space-y-2">
              {values.specifications.map((spec, index) => (
                <div
                  className="grid grid-cols-[1fr_1fr_auto] gap-2"
                  key={index}
                >
                  <input
                    aria-label={`Specification ${index + 1} name`}
                    className={inputClass}
                    list="spec-key-suggestions"
                    onChange={(e) => updateSpec(index, { key: e.target.value })}
                    placeholder="e.g. Processor"
                    value={spec.key}
                  />
                  <input
                    aria-label={`Specification ${index + 1} value`}
                    className={inputClass}
                    onChange={(e) =>
                      updateSpec(index, { value: e.target.value })
                    }
                    placeholder="e.g. Intel Core i7"
                    value={spec.value}
                  />
                  <button
                    aria-label={`Remove specification ${index + 1}`}
                    className="h-11 rounded-xl border border-white/10 px-3 text-slate-400 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300"
                    onClick={() =>
                      set(
                        "specifications",
                        values.specifications.length > 1
                          ? values.specifications.filter((_, i) => i !== index)
                          : [{ key: "", value: "" }],
                      )
                    }
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <datalist id="spec-key-suggestions">
              {specKeySuggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <button
              className="mt-2 h-9 rounded-xl border border-white/10 px-3 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
              onClick={() =>
                set("specifications", [
                  ...values.specifications,
                  { key: "", value: "" },
                ])
              }
              type="button"
            >
              + Add specification
            </button>
          </div>

          <Field helper="One feature per line." label="Features">
            <textarea
              className={textareaClass}
              onChange={(e) => set("features", e.target.value)}
              placeholder={"Backlit keyboard\nFingerprint reader"}
              value={values.features}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              error={err("warrantyMonths")}
              label="Warranty Period (months)"
            >
              <input
                {...bind("warrantyMonths")}
                className={numberClass}
                inputMode="numeric"
                min={0}
                onChange={(e) => set("warrantyMonths", e.target.value)}
                placeholder="e.g. 36"
                step={1}
                type="number"
                value={values.warrantyMonths}
              />
            </Field>
          </div>

          <TagInput
            label="Tags"
            onChange={(tags) => set("tags", tags)}
            placeholder="e.g. ultrabook, lightweight"
            values={values.tags}
          />
        </div>
      </details>
  );
}
