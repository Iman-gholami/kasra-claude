/**
 * Catalog domain types. These describe the contract between the UI and any
 * catalog data source (mock adapter today, a production API later), so they
 * intentionally avoid implementation details of the mock dataset.
 */

export type SizeSystem = "alpha" | "numeric";

export interface Category {
  slug: string;
  /** Persian display name, e.g. «مانتو». */
  name: string;
  /** Latin label used for subtle brand typography only. */
  latinName: string;
  description: string;
  /** Short line used on category tiles. */
  tagline: string;
  image: ImageAsset;
  sizeSystem: SizeSystem;
  /** Extra terms (transliterations, synonyms) that should match in search. */
  searchTerms: string[];
  order: number;
}

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export type ProductImageKind = "front" | "back" | "detail";

export interface ProductImage extends ImageAsset {
  colorId: string;
  kind: ProductImageKind;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

export interface ProductVariant {
  sku: string;
  colorId: string;
  size: string;
  /** Units available. 0 means the variant cannot be purchased. */
  stock: number;
}

export interface ProductAttribute {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  /** Selling price in Toman. */
  price: number;
  /** Previous price in Toman. Only present when strictly greater than `price`. */
  compareAtPrice?: number;
  description: string;
  images: ProductImage[];
  colors: ProductColor[];
  sizes: string[];
  variants: ProductVariant[];
  material: string;
  attributes: ProductAttribute[];
  fit?: string;
  care: string[];
  /** ISO 8601 date the product was added to the catalog. */
  createdAt: string;
  featured: boolean;
  tags: string[];
}

/** Lightweight projection used by grids, search suggestions and the wishlist. */
export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  image: ImageAsset;
  colors: ProductColor[];
  inStock: boolean;
  isNew: boolean;
}

export const SORT_KEYS = ["featured", "newest", "price-asc", "price-desc"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export interface CatalogQuery {
  category?: string;
  q?: string;
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
  /** Swatch colour for colour facets. */
  hex?: string;
}

export interface CatalogFacets {
  categories: FacetOption[];
  sizes: FacetOption[];
  colors: FacetOption[];
  price: { min: number; max: number };
  inStockCount: number;
  onSaleCount: number;
}

export interface CatalogResult {
  items: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  facets: CatalogFacets;
}

export interface SearchSuggestions {
  query: string;
  products: ProductSummary[];
  categories: Pick<Category, "slug" | "name">[];
  total: number;
}

/** Variant data needed by the quick-add sheet, fetched on demand. */
export interface ProductPurchaseInfo {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: ImageAsset;
  /** Front image per colour id, used for cart thumbnails. */
  colorImages: Record<string, ImageAsset>;
  colors: ProductColor[];
  sizes: string[];
  variants: ProductVariant[];
  categorySlug: string;
}
