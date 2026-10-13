"use client";

import { ChevronDown } from "lucide-react";
import { SORT_KEYS, type CatalogQuery, type SortKey } from "@/types/catalog";
import { SORT_LABELS, catalogHref } from "@/lib/catalog/search-params";
import { useCatalogTransition } from "./catalog-transition";

export function SortSelect({ basePath, query, omitCategory }: { basePath: string; query: CatalogQuery; omitCategory?: boolean }) {
  const { navigate } = useCatalogTransition();
  const relevance = Boolean(query.q) && !query.sort;
  return (
    <label className="relative inline-flex items-center gap-2 text-sm">
      <span className="hidden text-ink-muted sm:inline">مرتب‌سازی:</span>
      <span className="sr-only sm:hidden">مرتب‌سازی</span>
      <select
        value={relevance ? "relevance" : (query.sort ?? "featured")}
        onChange={(e) => {
          const value = e.target.value;
          const sort = value === "relevance" ? undefined : (value as SortKey);
          navigate(catalogHref(basePath, { ...query, sort, page: undefined }, { omitCategory }));
        }}
        className="h-11 appearance-none rounded-sm border border-line-strong bg-surface ps-3 pe-9 text-sm font-medium outline-none transition-colors hover:border-ink focus-visible:border-ink"
        data-testid="sort-select"
      >
        {query.q ? <option value="relevance">مرتبط‌ترین</option> : null}
        {SORT_KEYS.map((key) => (
          <option key={key} value={key}>
            {SORT_LABELS[key]}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute left-3 size-4 text-ink-muted" aria-hidden />
    </label>
  );
}
