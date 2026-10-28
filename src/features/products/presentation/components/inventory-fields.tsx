import { Field, currencies, selectClass, numberClass, labelClass, sectionClass, sectionTitleClass } from "@/features/products/presentation/components/product-form-controls";
import type { FieldProps } from "@/features/products/presentation/components/product-form-section-types";

type Props = FieldProps & { availability: string; availabilityColor: string };

export default function InventoryFields(props: Props) {
  const { values, set, err, bind, availability, availabilityColor } = props;
  return (
<fieldset className={sectionClass}>
        <legend className={`${sectionTitleClass} px-1`}>
          Pricing and Inventory
        </legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <Field error={err("sellingPrice")} label="Selling Price *">
            <input
              {...bind("sellingPrice")}
              className={numberClass}
              inputMode="decimal"
              min={0}
              onChange={(e) => set("sellingPrice", e.target.value)}
              placeholder="0.00"
              step="0.01"
              type="number"
              value={values.sellingPrice}
            />
          </Field>
          <Field label="Currency *">
            <select
              className={selectClass}
              onChange={(e) => set("currency", e.target.value)}
              value={values.currency}
            >
              {currencies.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field
            error={err("costPrice")}
            helper="Optional, internal only."
            label="Cost Price"
          >
            <input
              {...bind("costPrice")}
              className={numberClass}
              inputMode="decimal"
              min={0}
              onChange={(e) => set("costPrice", e.target.value)}
              placeholder="0.00"
              step="0.01"
              type="number"
              value={values.costPrice}
            />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field error={err("stockQuantity")} label="Stock Quantity *">
            <input
              {...bind("stockQuantity")}
              className={numberClass}
              inputMode="numeric"
              min={0}
              onChange={(e) => set("stockQuantity", e.target.value)}
              placeholder="0"
              step={1}
              type="number"
              value={values.stockQuantity}
            />
          </Field>
          <div>
            <span className={labelClass}>Availability Status</span>
            <div className="flex h-11 items-center justify-between gap-3">
              <span
                aria-live="polite"
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${availabilityColor}`}
              >
                {availability}
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  checked={values.discontinued}
                  className="size-4 accent-indigo-500"
                  onChange={(e) => set("discontinued", e.target.checked)}
                  type="checkbox"
                />
                Discontinued
              </label>
            </div>
          </div>
        </div>
      </fieldset>
  );
}
