export interface ProductSpec {
  key: string;
  value: string;
}

export interface ProductFormValues {
  name: string;
  brand: string;
  model: string;
  sku: string;
  description: string;
  imageUrl: string;
  category: string;
  type: string;
  subType: string;
  sellingPrice: string;
  currency: string;
  costPrice: string;
  stockQuantity: string;
  discontinued: boolean;
  specifications: ProductSpec[];
  features: string;
  warrantyMonths: string;
  tags: string[];
  targetCustomers: string[];
  useCases: string[];
  keyBenefits: string;
  limitations: string;
}

export type Product = ProductFormValues & { id: number };

export type ProductFormErrors = Partial<
  Record<keyof ProductFormValues, string>
>;

export const emptyProduct: ProductFormValues = {
  name: "",
  brand: "",
  model: "",
  sku: "",
  description: "",
  imageUrl: "",
  category: "",
  type: "",
  subType: "",
  sellingPrice: "",
  currency: "THB",
  costPrice: "",
  stockQuantity: "",
  discontinued: false,
  specifications: [{ key: "", value: "" }],
  features: "",
  warrantyMonths: "",
  tags: [],
  targetCustomers: [],
  useCases: [],
  keyBenefits: "",
  limitations: "",
};

export function validateProduct(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};
  const required = (
    field: "name" | "brand" | "category" | "type" | "subType",
    label: string,
  ) => {
    if (!values[field].trim()) errors[field] = `${label} is required.`;
  };
  required("name", "Product name");
  required("brand", "Brand");
  required("category", "Category");
  required("type", "Type");
  required("subType", "Sub type");

  const description = values.description.trim();
  if (!description) errors.description = "Description is required.";
  else if (description.length < 10)
    errors.description = "Description must contain at least 10 characters.";

  const url = values.imageUrl.trim();
  if (!url) errors.imageUrl = "Image URL is required.";
  else {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
        throw new Error("protocol");
    } catch {
      errors.imageUrl = "Enter a valid URL starting with http:// or https://.";
    }
  }

  const price = values.sellingPrice.trim();
  if (!price) errors.sellingPrice = "Selling price is required.";
  else if (!Number.isFinite(Number(price)) || Number(price) < 0)
    errors.sellingPrice = "Selling price must be a number of 0 or more.";

  const cost = values.costPrice.trim();
  if (cost && (!Number.isFinite(Number(cost)) || Number(cost) < 0))
    errors.costPrice = "Cost price must be a number of 0 or more.";

  const stock = values.stockQuantity.trim();
  if (!stock) errors.stockQuantity = "Stock quantity is required.";
  else if (!/^\d+$/.test(stock))
    errors.stockQuantity =
      "Stock quantity must be a whole number of 0 or more.";

  const warranty = values.warrantyMonths.trim();
  if (warranty && !/^\d+$/.test(warranty))
    errors.warrantyMonths = "Warranty must be a whole number of months.";

  return errors;
}
