import Link from "next/link";
import { X } from "lucide-react";
import type { CatalogFacets, CatalogQuery } from "@/types/catalog";
import { catalogHref, hasActiveRefinements } from "@/lib/catalog/search-params";
import { formatNumber } from "@/lib/persian";
import { sizeLabel } from "@/data/sizes";

interface ActiveFiltersProps {
  basePath: string;
  query: CatalogQuery;
  facets: CatalogFacets;
  omitCategory?: boolean;
}

function priceLabel(min?: number, max?: number) {
  const m = (v: number) => `${formatNumber(v / 1_000_000)} میلیون`;
  if (min && max) return `${m(min)} تا ${m(max)} تومان`;
  if (min) return `بیش از ${m(min)} تومان`;
  return `تا ${m(max!)} تومان`;
}

/** Removable chips for each active refinement. Plain links — no client JS required. */
export function ActiveFilters({ basePath, query, facets, omitCategory }: ActiveFiltersProps) {
  if (!hasActiveRefinements(query)) return null;
  const href = (next: CatalogQuery) => catalogHref(basePath, { ...next, page: undefined }, { omitCategory });
  const chips: { key: string; label: string; href: string }[] = [
    ...(query.sizes ?? []).map((s) => ({
      key: `size-${s}`,
      label: `سایز ${sizeLabel(s)}`,
      href: href({ ...query, sizes: query.sizes!.filter((v) => v !== s) }),
    })),
    ...(query.colors ?? []).map((c) => ({
      key: `color-${c}`,
      label: facets.colors.find((f) => f.value === c)?.label ?? c,
      href: href({ ...query, colors: query.colors!.filter((v) => v !== c) }),
    })),
    ...(query.minPrice || query.maxPrice
      ? [{ key: "price", label: priceLabel(query.minPrice, query.maxPrice), href: href({ ...query, minPrice: undefined, maxPrice: undefined }) }]
      : []),
    ...(query.inStock ? [{ key: "stock", label: "فقط موجود", href: href({ ...query, inStock: undefined }) }] : []),
    ...(query.onSale ? [{ key: "sale", label: "تخفیف‌دار", href: href({ ...query, onSale: undefined }) }] : []),
  ];
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="فیلترهای فعال" role="group">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          scroll={false}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-sand-soft ps-3.5 pe-2.5 text-[0.8125rem] transition-colors hover:bg-sand"
          aria-label={`حذف فیلتر ${chip.label}`}
        >
          {chip.label}
          <X className="size-3.5" aria-hidden />
        </Link>
      ))}
      <Link
        href={href({ category: query.category, q: query.q, sort: query.sort })}
        scroll={false}
        className="inline-flex h-9 items-center px-2 text-[0.8125rem] font-medium text-rose-deep underline underline-offset-4"
      >
        حذف همه
      </Link>
    </div>
  );
}
