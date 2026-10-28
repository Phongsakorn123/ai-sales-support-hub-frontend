"use client";

import type { FormEvent } from "react";
import type { ProductFormErrors, ProductFormValues } from "@/features/products/domain/product";
import ProductFormFields from "@/features/products/presentation/components/product-form-fields";
import { CloseIcon } from "@/features/dashboard/presentation/components/dashboard-icons";

type Props = {
  isOpen: boolean;
  productId: number | null;
  values: ProductFormValues;
  errors: ProductFormErrors;
  showAllErrors: boolean;
  message: string;
  isSaving: boolean;
  onClose: () => void;
  onChange: (values: ProductFormValues) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
};

export default function ProductEditorDialog({ isOpen, productId, values, errors, showAllErrors, message, isSaving, onClose, onChange, onSave }: Props) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <section
            aria-labelledby="product-dialog-title"
            aria-modal="true"
            className="my-auto w-full max-w-3xl rounded-2xl border border-white/[0.1] bg-[#111a2c] p-5 shadow-2xl shadow-black/40 sm:p-7"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className="text-lg font-semibold text-white"
                  id="product-dialog-title"
                >
                  {productId === null
                    ? "Add New Product"
                    : "Edit Product"}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Add a product to your catalog
                </p>
              </div>
              <button
                aria-label="Close dialog"
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300"
                onClick={onClose}
                type="button"
              >
                <CloseIcon />
              </button>
            </div>

            <form className="mt-5 space-y-4" noValidate onSubmit={onSave}>
              <ProductFormFields
                errors={errors}
                onChange={onChange}
                showAllErrors={showAllErrors}
                values={values}
              />

              {message && (
                <p className="text-xs text-rose-300" role="alert">
                  {message}
                </p>
              )}
              <p className="text-[11px] text-slate-500">
                Changes are saved to the product database when you confirm.
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  className="h-10 rounded-xl border border-white/[0.1] px-4 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="h-10 rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:opacity-60"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving
                    ? "Saving…"
                    : productId === null
                      ? "Create Product"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
