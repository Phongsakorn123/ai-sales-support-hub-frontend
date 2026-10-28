"use client";

import type { FormEvent } from "react";
import type { Product } from "@/features/products/domain/product";
import type { SuggestionState } from "@/features/search/presentation/components/suggestion-results";
import DetailedSearch from "@/features/search/presentation/components/detailed-search";
import VoiceSearch from "@/features/search/presentation/components/voice-search";
import SuggestionResults from "@/features/search/presentation/components/suggestion-results";
import { SearchIcon, SparkleIcon, HistoryIcon, BookIcon } from "@/features/dashboard/presentation/components/dashboard-icons";

type Props = {
  active: boolean;
  searchMode: "quick" | "detailed";
  setSearchMode: (mode: "quick" | "detailed") => void;
  searchText: string;
  setSearchText: (text: string) => void;
  searchMessage: string;
  setSearchMessage: (message: string) => void;
  quickMaxProducts: number;
  setQuickMaxProducts: (max: number) => void;
  quickIncludeOos: boolean;
  setQuickIncludeOos: (include: boolean) => void;
  suggestion: SuggestionState;
  products: Product[];
  runSuggestion: (requirements: string, max: number, oos: boolean) => Promise<void>;
  retrySearch: () => void;
  onResetSearch: () => void;
  submitSearch: (event: FormEvent<HTMLFormElement>) => void;
  voiceLanguage: string;
  submitVoiceQuery: (query: string) => void;
};

export default function SearchPanel(props: Props) {
  const { active, ...state } = props;
  const { searchMode, setSearchMode, searchText, setSearchText, searchMessage, setSearchMessage, quickMaxProducts, setQuickMaxProducts, quickIncludeOos, setQuickIncludeOos, suggestion, products, runSuggestion, retrySearch, onResetSearch, submitSearch, voiceLanguage, submitVoiceQuery } = state;
  return (
<section
          hidden={!active}
          aria-labelledby="search-title"
          className="rounded-2xl border border-white/[0.08] bg-[#0d1425] p-5 shadow-xl shadow-black/10 sm:p-7"
          id="search-panel"
          role="tabpanel"
          tabIndex={0}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200">
              <SearchIcon />
            </span>
            <div>
              <h2
                className="text-base font-semibold text-slate-100"
                id="search-title"
              >
                AI-Powered Product Search
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Use natural language to find products, select a model for
                inference, and export results with AI reasoning.
              </p>
            </div>
          </div>

          <form className="mt-6" onSubmit={submitSearch}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div
                aria-label="Search mode"
                className="inline-flex w-fit rounded-xl border border-white/[0.07] bg-[#080d1b] p-1"
                role="group"
              >
                <button
                  aria-pressed={searchMode === "quick"}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-indigo-300 ${
                    searchMode === "quick"
                      ? "bg-white/[0.08] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  onClick={() => setSearchMode("quick")}
                  type="button"
                >
                  <SearchIcon />
                  Quick Search
                </button>
                <button
                  aria-pressed={searchMode === "detailed"}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-indigo-300 ${
                    searchMode === "detailed"
                      ? "bg-white/[0.08] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  onClick={() => setSearchMode("detailed")}
                  type="button"
                >
                  <SparkleIcon />
                  Detailed Search
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-[#080d1b] px-3 text-xs text-slate-400">
                  Model
                  <select
                    className="max-w-[150px] bg-transparent text-xs text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    defaultValue="auto"
                    aria-label="Inference model"
                  >
                    <option value="auto">Auto (default)</option>
                    <option value="balanced">Balanced</option>
                    <option value="precise">High precision</option>
                  </select>
                </label>
                <button
                  className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] px-3 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
                  onClick={() =>
                    setSearchMessage("Search history is not connected yet.")
                  }
                  type="button"
                >
                  <HistoryIcon />
                  History
                  <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-slate-400">
                    2
                  </span>
                </button>
                <button
                  className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] px-3 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
                  onClick={() =>
                    setSearchText(
                      "Recommend a reliable, easy-to-maintain solution for a mid-sized laboratory.",
                    )
                  }
                  type="button"
                >
                  <BookIcon />
                  Templates
                </button>
              </div>
            </div>

            {searchMode === "quick" && (
              <>
                <label className="sr-only" htmlFor="customer-needs">
                  Describe your customer needs
                </label>
                <textarea
                  className="mt-5 min-h-20 w-full resize-y rounded-xl border border-white/[0.09] bg-[#080d1b] px-3.5 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                  id="customer-needs"
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Describe what your customer needs..."
                  value={searchText}
                />
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <label className="flex items-center gap-2">
                    Maximum products
                    <select
                      className="rounded-lg border border-white/10 bg-[#080d1b] px-2 py-1 text-xs text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      onChange={(event) =>
                        setQuickMaxProducts(Number(event.target.value))
                      }
                      value={quickMaxProducts}
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      checked={quickIncludeOos}
                      className="size-4 accent-indigo-500"
                      onChange={(event) =>
                        setQuickIncludeOos(event.target.checked)
                      }
                      type="checkbox"
                    />
                    Include out-of-stock products
                  </label>
                </div>
                <button
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  disabled={suggestion.status === "loading"}
                  type="submit"
                >
                  <SearchIcon />
                  {suggestion.status === "loading"
                    ? "Searching…"
                    : "Find Products"}
                </button>
                {searchMessage && (
                  <p
                    aria-live="polite"
                    className="mt-3 text-center text-xs text-slate-400"
                    role="status"
                  >
                    {searchMessage}
                  </p>
                )}
              </>
            )}
          </form>

          {searchMode === "detailed" && (
            <DetailedSearch
              brands={[
                ...new Set(products.map((p) => p.brand).filter(Boolean)),
              ].sort()}
              categories={[
                ...new Set(products.map((p) => p.category).filter(Boolean)),
              ].sort()}
              currencies={[
                ...new Set(products.map((p) => p.currency).filter(Boolean)),
              ].sort()}
              loading={suggestion.status === "loading"}
              onReset={onResetSearch}
              onSearch={(requirements, max, oos) =>
                void runSuggestion(requirements, max, oos)
              }
            />
          )}

          <SuggestionResults
            onRetry={retrySearch}
            onUseDetailSearch={() => setSearchMode("detailed")}
            state={suggestion}
          />

          {searchMode === "quick" && (
            <VoiceSearch
              language={voiceLanguage}
              onSubmitQuery={submitVoiceQuery}
            />
          )}
        </section>


  );
}
