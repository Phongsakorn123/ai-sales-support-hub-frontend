"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { SuggestionState } from "@/features/search/presentation/components/suggestion-results";
import { useDependencies } from "@/di/dependency-provider";

export default function useProductSearchViewModel() {
  const { search: searchUseCases } = useDependencies();
  const [searchMode, setSearchMode] = useState<"quick" | "detailed">("quick");
  const [searchText, setSearchText] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [suggestion, setSuggestion] = useState<SuggestionState>({ status: "idle" });
  const [quickMaxProducts, setQuickMaxProducts] = useState(3);
  const [quickIncludeOos, setQuickIncludeOos] = useState(false);
  const lastSearch = useRef<{ requirements: string; max: number; oos: boolean } | null>(null);
  const searchAbort = useRef<AbortController | null>(null);
  useEffect(() => () => searchAbort.current?.abort(), []);

  async function runSuggestion(
    requirements: string,
    max: number,
    oos: boolean,
  ): Promise<void> {
    if (suggestion.status === "loading") return;
    lastSearch.current = { requirements, max, oos };
    const controller = new AbortController();
    searchAbort.current = controller;
    setSuggestion({ status: "loading", requirements });
    try {
      const result = await searchUseCases.searchProducts(requirements, max, oos, controller.signal);
      setSuggestion({ status: "success", requirements, result });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setSuggestion({
        status: "error",
        requirements,
        message:
          error instanceof Error
            ? error.message
            : "Product search failed. Please try again.",
      });
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const problem = searchUseCases.validateRequirements(searchText);
    if (problem) {
      setSearchMessage(problem);
      return;
    }
    setSearchMessage("");
    void runSuggestion(searchText.trim(), quickMaxProducts, quickIncludeOos);
  }

  function retrySearch(): void {
    const last = lastSearch.current;
    if (last) void runSuggestion(last.requirements, last.max, last.oos);
  }

  function submitVoiceQuery(query: string): void {
    setSearchText(query);
    setSearchMessage(
      "Voice transcript placed in Quick Search. Press Find Products to search.",
    );
  }
  return { searchMode, setSearchMode, searchText, setSearchText, searchMessage, setSearchMessage, suggestion, setSuggestion, quickMaxProducts, setQuickMaxProducts, quickIncludeOos, setQuickIncludeOos, runSuggestion, submitSearch, retrySearch, submitVoiceQuery };
}
