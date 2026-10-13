/**
 * In-memory catalog adapter used by the demo. It mirrors what a backend would
 * do (search, disjunctive facet counts, sorting, pagination) so the UI only
 * ever receives one page of lightweight product summaries.
 */
import type {
  CatalogFacets,
  CatalogQuery,
  CatalogResult,
  FacetOption,
  Product,
  ProductSummary,
  SortKey,
} from "@/types/catalog";
import { CATEGORIES, PRODUCTS } from "@/data/catalog";
import { SIZE_LABELS, SIZE_ORDER } from "@/data/sizes";
import { compactPersian, normalizePersian } from "@/lib/persian";
import { DEFAULT_PAGE_SIZE } from "./search-params";
import type { CatalogRepository } from "./repository";

const NEW_WINDOW_DAYS = 21;
const DAY = 24 * 60 * 60 * 1000;

const categoryBySlug = new Map(CATEGORIES.map((c) => [c.slug, c]));
const productBySlug = new Map(PRODUCTS.map((p) => [p.slug, p]));
const productById = new Map(PRODUCTS.map((p) => [p.id, p]));

// "New" is relative to the newest item in the dataset so the demo stays stable over time.
const newestTimestamp = Math.max(...PRODUCTS.map((p) => Date.parse(p.createdAt)));

interface IndexedProduct {
  product: Product;
  summary: ProductSummary;
  name: string;
  nameCompact: string;
  haystack: string;
  haystackCompact: string;
  category: string;
}

function discountPercent(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return undefined;
  return Math.round((1 - price / compareAt) * 100);
}

function toSummary(product: Product): ProductSummary {
  const firstColor = product.colors[0]?.id;
  const front = product.images.find((i) => i.colorId === firstColor && i.kind === "front") ?? product.images[0];
  const category = categoryBySlug.get(product.categorySlug);
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    categorySlug: product.categorySlug,
    categoryName: category?.name ?? "",
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    discountPercent: discountPercent(product.price, product.compareAtPrice),
    image: { src: front.src, alt: front.alt, width: front.width, height: front.height },
    colors: product.colors,
    inStock: product.variants.some((v) => v.stock > 0),
    isNew: newestTimestamp - Date.parse(product.createdAt) <= NEW_WINDOW_DAYS * DAY,
  };
}

const INDEX: IndexedProduct[] = PRODUCTS.map((product) => {
  const category = categoryBySlug.get(product.categorySlug);
  const name = normalizePersian(product.name);
  const haystack = normalizePersian(
    [
      product.name,
      category?.name,
      ...(category?.searchTerms ?? []),
      product.material,
      ...product.tags,
      ...product.colors.map((c) => c.name),
      ...product.attributes.map((a) => a.value),
    ].join(" "),
  );
  return {
    product,
    summary: toSummary(product),
    name,
    nameCompact: compactPersian(name),
    haystack,
    haystackCompact: compactPersian(haystack),
    category: normalizePersian([category?.name, ...(category?.searchTerms ?? [])].join(" ")),
  };
});

/** Returns a relevance score, or 0 when not every query token matches. */
function searchScore(entry: IndexedProduct, tokens: string[], compactQuery: string): number {
  if (!tokens.length) return 1;
  let score = 0;
  for (const token of tokens) {
    if (entry.name.includes(token)) score += 10;
    else if (entry.category.includes(token)) score += 6;
    else if (entry.haystack.includes(token)) score += 3;
    else if (entry.haystackCompact.includes(compactPersian(token))) score += 2;
    else return 0;
  }
  if (compactQuery.length > 2 && entry.nameCompact.includes(compactQuery)) score += 8;
  return score;
}

function tokenize(q: string | undefined) {
  const normalized = normalizePersian(q ?? "");
  return { tokens: normalized ? normalized.split(" ").filter(Boolean) : [], compact: compactPersian(normalized) };
}

type FacetKey = "category" | "sizes" | "colors" | "price" | "inStock" | "onSale";

function matches(entry: IndexedProduct, query: CatalogQuery, skip?: FacetKey): boolean {
  const p = entry.product;
  if (skip !== "category" && query.category && p.categorySlug !== query.category) return false;
  if (skip !== "colors" && query.colors?.length && !p.colors.some((c) => query.colors!.includes(c.id))) return false;
  if (skip !== "sizes" && query.sizes?.length && !p.sizes.some((s) => query.sizes!.includes(s))) return false;
  if (skip !== "price") {
    if (query.minPrice && p.price < query.minPrice) return false;
    if (query.maxPrice && p.price > query.maxPrice) return false;
  }
  if (skip !== "onSale" && query.onSale && !p.compareAtPrice) return false;
  if (skip !== "inStock" && query.inStock) {
    // Availability honours the selected sizes/colours: a product only counts as
    // available if a matching variant can actually be bought.
    const available = p.variants.some(
      (v) =>
        v.stock > 0 &&
        (!query.sizes?.length || query.sizes.includes(v.size)) &&
        (!query.colors?.length || query.colors.includes(v.colorId)),
    );
    if (!available) return false;
  }
  return true;
}

function sortEntries(entries: { entry: IndexedProduct; score: number }[], sort: SortKey | undefined, hasQuery: boolean) {
  const byNewest = (a: IndexedProduct, b: IndexedProduct) => b.product.createdAt.localeCompare(a.product.createdAt);
  const effective = sort ?? (hasQuery ? undefined : "featured");
  entries.sort((a, b) => {
    // Sold-out products sink to the end for every ordering.
    const stock = Number(b.entry.summary.inStock) - Number(a.entry.summary.inStock);
    if (stock !== 0) return stock;
    switch (effective) {
      case "newest":
        return byNewest(a.entry, b.entry);
      case "price-asc":
        return a.entry.product.price - b.entry.product.price || byNewest(a.entry, b.entry);
      case "price-desc":
        return b.entry.product.price - a.entry.product.price || byNewest(a.entry, b.entry);
      case "featured":
        return Number(b.entry.product.featured) - Number(a.entry.product.featured) || byNewest(a.entry, b.entry);
      default:
        return b.score - a.score || byNewest(a.entry, b.entry);
    }
  });
}

function countOptions(pool: IndexedProduct[], values: (p: Product) => string[]) {
  const counts = new Map<string, number>();
  for (const entry of pool) for (const v of new Set(values(entry.product))) counts.set(v, (counts.get(v) ?? 0) + 1);
  return counts;
}

function buildFacets(searchPool: IndexedProduct[], query: CatalogQuery): CatalogFacets {
  const poolFor = (skip: FacetKey) => searchPool.filter((e) => matches(e, query, skip));

  const categoryCounts = countOptions(poolFor("category"), (p) => [p.categorySlug]);
  const categories: FacetOption[] = CATEGORIES.map((c) => ({
    value: c.slug,
    label: c.name,
    count: categoryCounts.get(c.slug) ?? 0,
  }));

  const sizePool = poolFor("sizes");
  const sizeCounts = countOptions(sizePool, (p) => p.sizes);
  const allSizes = new Set([...sizePool.flatMap((e) => e.product.sizes), ...(query.sizes ?? [])]);
  const sizes: FacetOption[] = [...allSizes]
    .sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b))
    .map((s) => ({ value: s, label: SIZE_LABELS[s] ?? s, count: sizeCounts.get(s) ?? 0 }));

  const colorPool = poolFor("colors");
  const colorCounts = countOptions(colorPool, (p) => p.colors.map((c) => c.id));
  const colorMeta = new Map(searchPool.flatMap((e) => e.product.colors).map((c) => [c.id, c]));
  const colors: FacetOption[] = [...colorMeta.values()]
    .filter((c) => (colorCounts.get(c.id) ?? 0) > 0 || query.colors?.includes(c.id))
    .map((c) => ({ value: c.id, label: c.name, hex: c.hex, count: colorCounts.get(c.id) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "fa"));

  const pricePool = poolFor("price");
  const prices = (pricePool.length ? pricePool : searchPool).map((e) => e.product.price);

  return {
    categories,
    sizes,
    colors,
    price: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 },
    inStockCount: poolFor("inStock").filter((e) => matches(e, { ...query, inStock: true })).length,
    onSaleCount: poolFor("onSale").filter((e) => e.product.compareAtPrice).length,
  };
}

function summaries(entries: IndexedProduct[]) {
  return entries.map((e) => e.summary);
}

export const mockCatalogRepository: CatalogRepository = {
  async listCategories() {
    return CATEGORIES;
  },

  async getCategory(slug) {
    return categoryBySlug.get(slug) ?? null;
  },

  async queryProducts(query) {
    const { tokens, compact } = tokenize(query.q);
    const scored = INDEX.map((entry) => ({ entry, score: searchScore(entry, tokens, compact) })).filter((s) => s.score > 0);
    const searchPool = scored.map((s) => s.entry);
    const filtered = scored.filter((s) => matches(s.entry, query));
    sortEntries(filtered, query.sort, tokens.length > 0);

    const pageSize = Math.min(Math.max(query.pageSize ?? DEFAULT_PAGE_SIZE, 1), 48);
    const total = filtered.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(query.page ?? 1, 1), pageCount);
    const items = summaries(filtered.slice((page - 1) * pageSize, page * pageSize).map((s) => s.entry));

    const result: CatalogResult = { items, total, page, pageSize, pageCount, facets: buildFacets(searchPool, query) };
    return result;
  },

  async getProduct(slug) {
    return productBySlug.get(slug) ?? null;
  },

  async getProductSummaries(ids) {
    return ids.flatMap((id) => {
      const product = productById.get(id);
      return product ? [INDEX.find((e) => e.product === product)!.summary] : [];
    });
  },

  async getPurchaseInfo(slug) {
    const product = productBySlug.get(slug);
    if (!product) return null;
    const summary = INDEX.find((e) => e.product === product)!.summary;
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      image: summary.image,
      colorImages: Object.fromEntries(
        product.images
          .filter((i) => i.kind === "front")
          .map((i) => [i.colorId, { src: i.src, alt: i.alt, width: i.width, height: i.height }]),
      ),
      colors: product.colors,
      sizes: product.sizes,
      variants: product.variants,
      categorySlug: product.categorySlug,
    };
  },

  async getRelatedProducts(slug, limit) {
    const product = productBySlug.get(slug);
    if (!product) return [];
    const sameCategory = INDEX.filter((e) => e.product.categorySlug === product.categorySlug && e.product.id !== product.id);
    // Prefer items sharing tags, then in-stock and newer pieces.
    const ranked = sameCategory
      .map((e) => ({ e, shared: e.product.tags.filter((t) => product.tags.includes(t)).length }))
      .sort(
        (a, b) =>
          Number(b.e.summary.inStock) - Number(a.e.summary.inStock) ||
          b.shared - a.shared ||
          b.e.product.createdAt.localeCompare(a.e.product.createdAt),
      );
    return ranked.slice(0, limit).map((r) => r.e.summary);
  },

  async getNewArrivals(limit) {
    return summaries(
      [...INDEX]
        .filter((e) => e.summary.inStock)
        .sort((a, b) => b.product.createdAt.localeCompare(a.product.createdAt))
        .slice(0, limit),
    );
  },

  async getFeaturedProducts(limit, excludeIds = []) {
    return summaries(
      INDEX.filter((e) => e.product.featured && e.summary.inStock && !excludeIds.includes(e.product.id)).slice(0, limit),
    );
  },

  async suggest(query, limit) {
    const { tokens, compact } = tokenize(query);
    if (!tokens.length) return { query, products: [], categories: [], total: 0 };
    const scored = INDEX.map((entry) => ({ entry, score: searchScore(entry, tokens, compact) })).filter((s) => s.score > 0);
    sortEntries(scored, undefined, true);
    const categories = CATEGORIES.filter((c) => {
      const terms = normalizePersian([c.name, ...c.searchTerms].join(" "));
      return tokens.some((t) => terms.includes(t) || compactPersian(terms).includes(compactPersian(t)));
    }).map((c) => ({ slug: c.slug, name: c.name }));
    return {
      query,
      products: scored.slice(0, limit).map((s) => s.entry.summary),
      categories,
      total: scored.length,
    };
  },

  async listProductSlugs() {
    return PRODUCTS.map((p) => p.slug);
  },
};
