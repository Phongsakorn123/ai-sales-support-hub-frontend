import type { ProductFormValues } from "@/features/products/domain/product";
export type BindField = (field: keyof ProductFormValues) => { onBlur: () => void; "aria-invalid"?: boolean };
export type SetField = <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => void;
export type FieldProps = { values: ProductFormValues; set: SetField; err: (field: keyof ProductFormValues) => string | undefined; bind: BindField };
