import { SearchX } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import type { CatalogQuery, CatalogResult } from "@/types/catalog";
import { queryCatalog } from "@/lib/catalog";
import { catalogHref, hasActiveRefinements } from "@/lib/catalog/search-params";
import { formatNumber } from "@/lib/persian";
import { ProductGrid } from "@/components/products/product-grid";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ActiveFilters } from "./active-filters";
import { CatalogResultsRegion, CatalogTransitionProvider } from "./catalog-transition";
import { FilterPanel } from "./filter-panel";
import { MobileFilters } from "./mobile-filters";
import { Pagination } from "./pagination";
import { SortSelect } from "./sort-select";

interface CatalogViewProps {
  basePath: string;
  query: CatalogQuery;
  result: CatalogResult;
  omitCategory?: boolean;
  showCategories?: boolean;
}

function activeCount(q: CatalogQuery) {
  return (q.sizes?.length ?? 0) + (q.colors?.length ?? 0) + (q.minPrice || q.maxPrice ? 1 : 0) + (q.inStock ? 1 : 0) + (q.onSale ? 1 : 0);
}

/** Filterable product listing shared by /shop, /category/[slug] and /search. */
export function CatalogView({ basePath, query, result, omitCategory, showCategories }: CatalogViewProps) {
  const panel = { basePath, query, facets: result.facets, omitCategory, showCategories };
  const resetHref = catalogHref(basePath, { category: query.category, q: query.q }, { omitCategory });
  return (
    <CatalogTransitionProvider>
      <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10 xl:grid-cols-[16.5rem_1fr] xl:gap-14">
        <aside className="hidden lg:block" aria-label="فیلتر محصولات">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain pe-2 pb-6 scrollbar-none">
            <FilterPanel {...panel} idPrefix="desktop" />
          </div>
        </aside>

        <section aria-labelledby="results-heading">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
            <h2 id="results-heading" className="text-sm text-ink-soft" aria-live="polite" data-testid="result-count">
              {formatNumber(result.total)} محصول
            </h2>
            <div className="flex items-center gap-2">
              <MobileFilters {...panel} total={result.total} activeCount={activeCount(query)} />
              <SortSelect basePath={basePath} query={query} omitCategory={omitCategory} />
            </div>
          </div>

          <CatalogResultsRegion className="pt-5">
            <ActiveFilters basePath={basePath} query={query} facets={result.facets} omitCategory={omitCategory} />
            {result.items.length ? (
              <>
                <ProductGrid products={result.items} eagerCount={result.page === 1 ? 4 : 2} className="mt-6" />
                <Pagination basePath={basePath} query={query} page={result.page} pageCount={result.pageCount} omitCategory={omitCategory} />
              </>
            ) : (
              <EmptyState
                icon={<SearchX className="size-7" strokeWidth={1.5} />}
                title={query.q ? `محصولی برای «${query.q}» پیدا نشد` : "محصولی با این فیلترها پیدا نشد"}
                description={
                  hasActiveRefinements(query)
                    ? "برخی از فیلترها را بردارید یا بازه‌ی قیمت گسترده‌تری انتخاب کنید."
                    : "عبارت دیگری را جستجو کنید یا سری به همه‌ی محصولات بزنید."
                }
                action={
                  <>
                    {hasActiveRefinements(query) ? (
                      <ButtonLink href={resetHref} scroll={false}>
                        حذف فیلترها
                      </ButtonLink>
                    ) : null}
                    <ButtonLink href="/shop" variant="secondary">
                      همه‌ی محصولات
                    </ButtonLink>
                  </>
                }
              />
            )}
          </CatalogResultsRegion>
        </section>
      </div>
    </CatalogTransitionProvider>
  );
}

/**
 * Renders a listing for an already-parsed query and caches the rendered
 * output per query. Pages read `searchParams` (request data) outside this
 * boundary and pass the normalized query in, so repeat visits to the same
 * filter URL skip server rendering of the whole listing.
 */
export async function CachedCatalogView(props: Omit<CatalogViewProps, "result">) {
  "use cache";
  cacheLife("catalog");
  cacheTag("catalog", "listings");
  const result = await queryCatalog(props.query);
  return <CatalogView {...props} result={result} />;
}

/** Static placeholder shown while request-specific results stream in. */
export function CatalogSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10 xl:grid-cols-[16.5rem_1fr] xl:gap-14" aria-hidden>
      <div className="hidden space-y-4 lg:block">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-sm bg-sand-soft" />
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="h-5 w-20 rounded-xs bg-sand-soft" />
          <div className="h-11 w-40 rounded-sm bg-sand-soft" />
        </div>
        <ul className="mt-11 grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-3 sm:gap-x-5 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i}>
              <div className="aspect-[3/4] animate-pulse rounded-xs bg-sand-soft" />
              <div className="mt-3 h-4 w-3/4 rounded-xs bg-sand-soft" />
              <div className="mt-2 h-4 w-1/3 rounded-xs bg-sand-soft" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
