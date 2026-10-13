"use client";

import { Check } from "lucide-react";
import { useOptimistic } from "react";
import type { CatalogFacets, CatalogQuery } from "@/types/catalog";
import { catalogHref, hasActiveRefinements } from "@/lib/catalog/search-params";
import { formatNumber } from "@/lib/persian";
import { cn } from "@/lib/cn";
import { useCatalogTransition } from "./catalog-transition";

export const PRICE_RANGES = [
  { id: "u1", label: "تا ۱ میلیون تومان", min: undefined, max: 1_000_000 },
  { id: "1-2", label: "۱ تا ۲ میلیون تومان", min: 1_000_000, max: 2_000_000 },
  { id: "2-35", label: "۲ تا ۳٫۵ میلیون تومان", min: 2_000_000, max: 3_500_000 },
  { id: "35+", label: "بیش از ۳٫۵ میلیون تومان", min: 3_500_000, max: undefined },
] as const;

export interface FilterPanelProps {
  basePath: string;
  query: CatalogQuery;
  facets: CatalogFacets;
  /** Category lives in the path on category pages. */
  omitCategory?: boolean;
  showCategories?: boolean;
  idPrefix: string;
}

function toggle(list: string[] | undefined, value: string) {
  const set = new Set(list ?? []);
  if (set.has(value)) set.delete(value);
  else set.add(value);
  return set.size ? [...set] : undefined;
}

export function FilterPanel({ basePath, query, facets, omitCategory, showCategories, idPrefix }: FilterPanelProps) {
  const { navigate } = useCatalogTransition();
  // Controls reflect the user's choice immediately while the server renders new results.
  const [optimistic, setOptimistic] = useOptimistic(query);

  const apply = (next: CatalogQuery) => {
    const nextQuery = { ...next, page: undefined };
    navigate(catalogHref(basePath, nextQuery, { omitCategory }), () => setOptimistic(nextQuery));
  };

  const activePrice = PRICE_RANGES.find((r) => r.min === optimistic.minPrice && r.max === optimistic.maxPrice)?.id;
  const customPrice = !activePrice && (optimistic.minPrice || optimistic.maxPrice);

  return (
    <div className="divide-y divide-line" data-testid="filter-panel">
      {showCategories ? (
        <FilterSection title="دسته‌بندی">
          <ul className="space-y-0.5">
            {[{ value: undefined, label: "همه", count: undefined }, ...facets.categories].map((c) => {
              const checked = optimistic.category === c.value;
              return (
                <li key={c.label}>
                  <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="radio"
                      name={`${idPrefix}-category`}
                      checked={checked}
                      onChange={() => apply({ ...optimistic, category: c.value, sizes: undefined })}
                      className="size-4 accent-ink"
                    />
                    <span className={cn("flex-1", checked && "font-semibold")}>{c.label}</span>
                    {c.count !== undefined ? <span className="text-xs text-ink-muted tabular-nums">{formatNumber(c.count)}</span> : null}
                  </label>
                </li>
              );
            })}
          </ul>
        </FilterSection>
      ) : null}

      <FilterSection title="سایز">
        <div className="flex flex-wrap gap-2">
          {facets.sizes.map((s) => {
            const checked = optimistic.sizes?.includes(s.value) ?? false;
            const disabled = s.count === 0 && !checked;
            return (
              <label key={s.value} className={cn("relative", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => apply({ ...optimistic, sizes: toggle(optimistic.sizes, s.value) })}
                  aria-label={`سایز ${s.label} (${formatNumber(s.count)} محصول)`}
                  data-testid={`filter-size-${s.value}`}
                />
                <span
                  aria-hidden
                  className="flex h-10 min-w-11 items-center justify-center rounded-sm border border-line-strong bg-surface px-2.5 text-sm tabular-nums transition-colors peer-hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink peer-disabled:opacity-40"
                >
                  {s.label}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="رنگ">
        <ul className="space-y-0.5">
          {facets.colors.map((c) => {
            const checked = optimistic.colors?.includes(c.value) ?? false;
            return (
              <li key={c.value}>
                <label className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    onChange={() => apply({ ...optimistic, colors: toggle(optimistic.colors, c.value) })}
                    data-testid={`filter-color-${c.value}`}
                  />
                  <span
                    aria-hidden
                    className="relative flex size-6 shrink-0 items-center justify-center rounded-full border border-black/15 ring-offset-2 ring-offset-surface peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ink"
                    style={{ backgroundColor: c.hex }}
                  >
                    {checked ? <Check className={cn("size-3.5", isLight(c.hex ?? "#000000") ? "text-ink" : "text-white")} strokeWidth={3} /> : null}
                  </span>
                  <span className={cn("flex-1", checked && "font-semibold")}>{c.label}</span>
                  <span className="text-xs text-ink-muted tabular-nums">{formatNumber(c.count)}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      <FilterSection title="محدوده‌ی قیمت">
        <ul className="space-y-0.5">
          {PRICE_RANGES.map((r) => (
            <li key={r.id}>
              <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm">
                <input
                  type="radio"
                  name={`${idPrefix}-price`}
                  checked={activePrice === r.id}
                  onChange={() => apply({ ...optimistic, minPrice: r.min, maxPrice: r.max })}
                  className="size-4 accent-ink"
                />
                <span className={cn(activePrice === r.id && "font-semibold")}>{r.label}</span>
              </label>
            </li>
          ))}
          {customPrice ? (
            <li className="py-2 text-xs text-ink-muted">بازه‌ی دلخواه از نشانی صفحه اعمال شده است.</li>
          ) : null}
          {activePrice || customPrice ? (
            <li>
              <button
                type="button"
                onClick={() => apply({ ...optimistic, minPrice: undefined, maxPrice: undefined })}
                className="mt-1 py-2 text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
              >
                همه‌ی قیمت‌ها
              </button>
            </li>
          ) : null}
        </ul>
      </FilterSection>

      <FilterSection title="وضعیت">
        <div className="space-y-1">
          <SwitchRow
            label="فقط کالاهای موجود"
            count={facets.inStockCount}
            checked={Boolean(optimistic.inStock)}
            onChange={(v) => apply({ ...optimistic, inStock: v || undefined })}
            testId="filter-in-stock"
          />
          <SwitchRow
            label="فقط تخفیف‌دارها"
            count={facets.onSaleCount}
            checked={Boolean(optimistic.onSale)}
            onChange={(v) => apply({ ...optimistic, onSale: v || undefined })}
            testId="filter-on-sale"
          />
        </div>
      </FilterSection>

      {hasActiveRefinements(optimistic) ? (
        <div className="py-5">
          <button
            type="button"
            onClick={() => apply({ category: optimistic.category, q: optimistic.q, sort: optimistic.sort })}
            className="text-sm font-medium text-rose-deep underline underline-offset-4"
          >
            حذف همه‌ی فیلترها
          </button>
        </div>
      ) : null}
    </div>
  );
}

function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="py-5 first:pt-0">
      <legend className="float-start mb-3 w-full text-sm font-bold">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

function SwitchRow({
  label,
  count,
  checked,
  onChange,
  testId,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: (value: boolean) => void;
  testId: string;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm">
      <span className={cn(checked && "font-semibold")}>
        {label} <span className="text-xs text-ink-muted tabular-nums">({formatNumber(count)})</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
        data-testid={testId}
      />
      <span
        aria-hidden
        className="relative h-6 w-10 shrink-0 rounded-full bg-line-strong transition-colors after:absolute after:top-0.5 after:right-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-soft after:transition-transform peer-checked:bg-ink peer-checked:after:-translate-x-4 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
      />
    </label>
  );
}
