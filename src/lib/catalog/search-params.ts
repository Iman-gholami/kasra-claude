/**
 * Conversion between catalog URL search parameters and `CatalogQuery`.
 * Shared by server components (parsing `searchParams`) and client filter
 * controls (building the next URL), so the URL format is defined once.
 *
 *   /shop?category=manto&size=40,42&color=black&min=1000000&max=3000000
 *        &stock=1&sale=1&sort=price-asc&page=2&q=لینن
 */
import { SORT_KEYS, type CatalogQuery, type SortKey } from "@/types/catalog";
import { toLatinDigits } from "@/lib/persian";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const DEFAULT_PAGE_SIZE = 12;
const MAX_LIST_VALUES = 20;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function list(value: string | string[] | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  const parts = (Array.isArray(value) ? value : [value])
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
  const unique = [...new Set(parts)].slice(0, MAX_LIST_VALUES);
  return unique.length ? unique : undefined;
}

function positiveInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number.parseInt(toLatinDigits(value), 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function parseCatalogSearchParams(params: RawSearchParams): CatalogQuery {
  const sort = first(params.sort);
  const q = first(params.q)?.trim().slice(0, 80);
  let minPrice = positiveInt(first(params.min));
  let maxPrice = positiveInt(first(params.max));
  if (minPrice && maxPrice && minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];
  return {
    category: first(params.category)?.trim() || undefined,
    q: q || undefined,
    sizes: list(params.size),
    colors: list(params.color),
    minPrice,
    maxPrice,
    inStock: first(params.stock) === "1" || undefined,
    onSale: first(params.sale) === "1" || undefined,
    sort: SORT_KEYS.includes(sort as SortKey) ? (sort as SortKey) : undefined,
    page: positiveInt(first(params.page)),
  };
}

/**
 * Serializes a query to a canonical, stable query string (without "?").
 * `omitCategory` is used on /category/[slug] where the category is in the path.
 */
export function serializeCatalogQuery(query: CatalogQuery, options: { omitCategory?: boolean } = {}): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.category && !options.omitCategory) params.set("category", query.category);
  if (query.sizes?.length) params.set("size", query.sizes.join(","));
  if (query.colors?.length) params.set("color", query.colors.join(","));
  if (query.minPrice) params.set("min", String(query.minPrice));
  if (query.maxPrice) params.set("max", String(query.maxPrice));
  if (query.inStock) params.set("stock", "1");
  if (query.onSale) params.set("sale", "1");
  if (query.sort) params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  return params.toString().replace(/%2C/g, ",");
}

export function catalogHref(basePath: string, query: CatalogQuery, options?: { omitCategory?: boolean }) {
  const qs = serializeCatalogQuery(query, options);
  return qs ? `${basePath}?${qs}` : basePath;
}

/** True when any refinement beyond category/search is active. */
export function hasActiveRefinements(query: CatalogQuery): boolean {
  return Boolean(
    query.sizes?.length || query.colors?.length || query.minPrice || query.maxPrice || query.inStock || query.onSale,
  );
}

export const SORT_LABELS: Record<SortKey, string> = {
  featured: "پیشنهاد کسرا",
  newest: "جدیدترین",
  "price-asc": "ارزان‌ترین",
  "price-desc": "گران‌ترین",
};
