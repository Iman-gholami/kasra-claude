/**
 * Catalog data-access contract.
 *
 * UI code depends only on this interface (through `src/lib/catalog/index.ts`).
 * The demo ships a mock adapter backed by in-memory data; a production adapter
 * would call the backend API (products, categories, inventory, search) and map
 * its responses to these domain types. See docs/backend-integration.md.
 */
import type {
  CatalogQuery,
  CatalogResult,
  Category,
  Product,
  ProductPurchaseInfo,
  ProductSummary,
  SearchSuggestions,
} from "@/types/catalog";

export interface CatalogRepository {
  listCategories(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | null>;

  /** Filtered, sorted and paginated listing with facet counts. Filtering happens server-side. */
  queryProducts(query: CatalogQuery): Promise<CatalogResult>;

  getProduct(slug: string): Promise<Product | null>;
  getProductSummaries(ids: string[]): Promise<ProductSummary[]>;
  getPurchaseInfo(slug: string): Promise<ProductPurchaseInfo | null>;
  getRelatedProducts(slug: string, limit: number): Promise<ProductSummary[]>;
  getNewArrivals(limit: number): Promise<ProductSummary[]>;
  getFeaturedProducts(limit: number, excludeIds?: string[]): Promise<ProductSummary[]>;

  /** Lightweight typeahead results. */
  suggest(query: string, limit: number): Promise<SearchSuggestions>;

  /** Every product slug, for static generation and the sitemap. */
  listProductSlugs(): Promise<string[]>;
}
