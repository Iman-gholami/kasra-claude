/**
 * Server-side catalog accessors used by pages, layouts and route handlers.
 *
 * Every read goes through the configured `CatalogRepository` and is cached
 * with `"use cache"` plus tags, so a future backend can invalidate precisely
 * (e.g. `revalidateTag("product:<slug>")` from an inventory webhook).
 * Cache lifetimes use the `catalog` profile defined in next.config.ts.
 */
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { CatalogQuery } from "@/types/catalog";
import { mockCatalogRepository } from "./mock-repository";
import type { CatalogRepository } from "./repository";

/**
 * Adapter selection. Only the mock adapter exists in this phase; a production
 * adapter (e.g. `createApiCatalogRepository(process.env.CATALOG_API_URL)`)
 * plugs in here without touching any UI code.
 */
const repository: CatalogRepository = mockCatalogRepository;

export async function getCategories() {
  "use cache";
  cacheLife("catalog");
  cacheTag("catalog", "categories");
  return repository.listCategories();
}

export async function getCategory(slug: string) {
  "use cache";
  cacheLife("catalog");
  cacheTag("catalog", "categories");
  return repository.getCategory(slug);
}

export async function queryCatalog(query: CatalogQuery) {
  "use cache";
  cacheLife("catalog");
  cacheTag("catalog", "listings");
  return repository.queryProducts(query);
}

export async function getProduct(slug: string) {
  "use cache";
  cacheLife("catalog");
  cacheTag("catalog", `product:${slug}`);
  return repository.getProduct(slug);
}

export async function getPurchaseInfo(slug: string) {
  "use cache";
  cacheLife("catalog");
  cacheTag("catalog", `product:${slug}`);
  return repository.getPurchaseInfo(slug);
}

export async function getProductSummaries(ids: string[]) {
  "use cache";
  cacheLife("catalog");
  cacheTag("catalog", "listings");
  return repository.getProductSummaries(ids);
}

export async function getRelatedProducts(slug: string, limit = 4) {
  "use cache";
  cacheLife("catalog");
  cacheTag("catalog", "listings");
  return repository.getRelatedProducts(slug, limit);
}

export async function getNewArrivals(limit = 4) {
  "use cache";
  cacheLife("catalog");
  cacheTag("catalog", "listings");
  return repository.getNewArrivals(limit);
}

export async function getFeaturedProducts(limit = 4, excludeIds: string[] = []) {
  "use cache";
  cacheLife("catalog");
  cacheTag("catalog", "listings");
  return repository.getFeaturedProducts(limit, excludeIds);
}

export async function getSearchSuggestions(query: string, limit = 6) {
  "use cache";
  cacheLife("catalog");
  cacheTag("catalog", "search");
  return repository.suggest(query, limit);
}

export async function getProductSlugs() {
  "use cache";
  cacheLife("catalog");
  cacheTag("catalog", "listings");
  return repository.listProductSlugs();
}
