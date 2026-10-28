"use client";

import { useState, type FormEvent } from "react";
import { useDependencies } from "@/di/dependency-provider";
import type { DetailCriteria } from "@/features/search/domain/search-types";

const initialCriteria: DetailCriteria = {
  category: "",
  brand: "",
  maxBudget: "",
  currency: "THB",
  minRamGb: "",
  features: "",
  purpose: "",
};

export function useDetailedSearchViewModel({
  currencies,
  loading,
  onSearch,
  onReset,
}: {
  currencies: string[];
  loading: boolean;
  onSearch: (query: string, maxProducts: number, includeOutOfStock: boolean) => void;
  onReset: () => void;
}) {
  const { search } = useDependencies();
  const [criteria, setCriteria] = useState(initialCriteria);
  const [maxProducts, setMaxProducts] = useState(3);
  const [includeOutOfStock, setIncludeOutOfStock] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const errors = search.validateDetailCriteria(criteria);

  function update<K extends keyof DetailCriteria>(key: K, value: DetailCriteria[K]) {
    setCriteria((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      return;
    }
    onSearch(search.buildDetailQuery(criteria), maxProducts, includeOutOfStock);
  }

  function reset() {
    setCriteria(initialCriteria);
    setMaxProducts(3);
    setIncludeOutOfStock(false);
    setShowErrors(false);
    onReset();
  }

  return {
    criteria,
    update,
    submit,
    reset,
    errors: showErrors ? errors : {},
    maxProducts,
    setMaxProducts,
    includeOutOfStock,
    setIncludeOutOfStock,
    currencyChoices: [...new Set(["THB", ...currencies])],
  };
}
