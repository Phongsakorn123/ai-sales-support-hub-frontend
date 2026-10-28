import type { Dispatch, SetStateAction } from "react";
import type { FieldProps } from "@/features/products/presentation/components/product-form-section-types";
import type { ProductFormValues } from "@/features/products/domain/product";
import { Field, inputClass, selectClass, textareaClass, sectionClass, sectionTitleClass } from "@/features/products/presentation/components/product-form-controls";
import { productImageUrl } from "@/features/products/presentation/utils/product-image-url";

type Props = { values: ProductFormValues; set: FieldProps["set"]; err: FieldProps["err"]; bind: FieldProps["bind"]; categories: string[]; types: string[]; subTypes: string[]; canPreview: boolean; imageUrl: string; imageFailed: string; setImageFailed: Dispatch<SetStateAction<string>>; onChange: (values: ProductFormValues) => void };

export default function BasicInformationFields(props: Props) {
  const { values, set, err, bind, categories, types, subTypes, canPreview, imageUrl, imageFailed, setImageFailed, onChange } = props;
  return (
<fieldset className={sectionClass}>
        <legend className={`${sectionTitleClass} px-1`}>
          Basic Information
        </legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <Field error={err("name")} label="Product Name *">
            <input
              {...bind("name")}
              autoFocus
              className={inputClass}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. ThinkPad X1 Carbon"
              value={values.name}
            />
          </Field>
          <Field error={err("brand")} label="Brand *">
            <input
              {...bind("brand")}
              className={inputClass}
              onChange={(e) => set("brand", e.target.value)}
              placeholder="e.g. Lenovo"
              value={values.brand}
            />
          </Field>
          <Field label="Model">
            <input
              className={inputClass}
              onChange={(e) => set("model", e.target.value)}
              placeholder="e.g. Gen 12"
              value={values.model}
            />
          </Field>
          <Field helper="Your internal stock-keeping unit." label="SKU">
            <input
              className={inputClass}
              onChange={(e) => set("sku", e.target.value)}
              placeholder="e.g. LNV-X1C-G12"
              value={values.sku}
            />
          </Field>
        </div>

        <Field
          className="mt-4"
          error={err("description")}
          label="Description * (minimum 10 characters)"
        >
          <textarea
            {...bind("description")}
            className={textareaClass}
            maxLength={1000}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Briefly describe the product for sales teams and customers."
            value={values.description}
          />
          <span className="mt-1 block text-[11px] text-slate-500">
            {values.description.length}/1000 characters
          </span>
        </Field>

        <Field
          className="mt-4"
          error={err("imageUrl")}
          helper="Link to a product image (http or https)."
          label="Image URL *"
        >
          <input
            {...bind("imageUrl")}
            className={inputClass}
            inputMode="url"
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://example.com/product.jpg"
            type="url"
            value={values.imageUrl}
          />
        </Field>
        {canPreview && (
          <div className="mt-2 flex h-32 items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-[#080d1b]">
            {imageFailed === imageUrl ? (
              <span className="text-xs text-slate-500">
                Image could not be loaded.
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Product preview"
                className="max-h-full max-w-full object-contain"
                onError={() => setImageFailed(imageUrl)}
                src={productImageUrl(imageUrl)}
              />
            )}
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field error={err("category")} label="Category *">
            <select
              {...bind("category")}
              className={selectClass}
              onChange={(e) =>
                onChange({
                  ...values,
                  category: e.target.value,
                  type: "",
                  subType: "",
                })
              }
              value={values.category}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field error={err("type")} label="Type *">
            <select
              {...bind("type")}
              className={selectClass}
              disabled={!values.category}
              onChange={(e) =>
                onChange({ ...values, type: e.target.value, subType: "" })
              }
              value={values.type}
            >
              <option value="">Select type</option>
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field error={err("subType")} label="Sub Type *">
            <select
              {...bind("subType")}
              className={selectClass}
              disabled={!values.type}
              onChange={(e) => set("subType", e.target.value)}
              value={values.subType}
            >
              <option value="">Select sub type</option>
              {subTypes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>
  );
}
