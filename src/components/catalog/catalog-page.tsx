import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getCategory } from "@/lib/catalog";
import { parseCatalogSearchParams, type RawSearchParams } from "@/lib/catalog/search-params";
import { CachedCatalogView, CatalogSkeleton } from "./catalog-view";

/*
 * Shared building blocks for the listing pages. The page shell (breadcrumbs,
 * headings) is prerendered; results depend on searchParams and stream in at
 * request time, with the rendered listing cached per normalized query.
 */

export const SHOP_DESCRIPTION = "همه‌ی شومیزها، مانتوها و تیشرت‌های بوتیک کسرا با امکان فیلتر بر اساس سایز، رنگ، قیمت و موجودی.";

export function ShopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page pt-5 md:pt-8">
      <Breadcrumbs items={[{ label: "فروشگاه" }]} />
      <header className="mt-6 mb-8 max-w-2xl md:mt-8 md:mb-10">
        <h1 className="text-[1.75rem] font-extrabold tracking-tight md:text-4xl">همه‌ی محصولات</h1>
        <p className="mt-3 leading-7 text-ink-soft">{SHOP_DESCRIPTION}</p>
      </header>
      {children}
    </div>
  );
}

export async function ShopResults({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const query = parseCatalogSearchParams(await searchParams);
  return <CachedCatalogView basePath="/shop" query={query} showCategories />;
}

type Params = Promise<{ slug: string }>;

export function CategoryShell({ params, children }: { params: Params; children: React.ReactNode }) {
  return (
    <div className="container-page pt-5 md:pt-8">
      <Suspense fallback={<CategoryHeaderFallback />}>
        <CategoryHeader params={params} />
      </Suspense>
      <Suspense fallback={<CatalogSkeleton />}>{children}</Suspense>
    </div>
  );
}

async function CategoryHeader({ params }: { params: Params }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  return (
    <>
      <Breadcrumbs items={[{ href: "/shop", label: "فروشگاه" }, { label: category.name }]} />
      <header className="mt-6 mb-8 max-w-2xl md:mt-8 md:mb-10">
        <p className="eyebrow uppercase tracking-[0.2em]">
          <span dir="ltr">{category.latinName}</span>
        </p>
        <h1 className="mt-2 text-[1.75rem] font-extrabold tracking-tight md:text-4xl">{category.name}</h1>
        <p className="mt-3 leading-7 text-ink-soft">{category.description}</p>
      </header>
    </>
  );
}

function CategoryHeaderFallback() {
  return (
    <div aria-hidden className="mb-8 md:mb-10">
      <div className="h-4 w-32 rounded-xs bg-sand-soft" />
      <div className="mt-8 h-10 w-40 rounded-xs bg-sand-soft" />
      <div className="mt-4 h-5 w-full max-w-xl rounded-xs bg-sand-soft" />
    </div>
  );
}

export async function CategoryResults({ params, searchParams }: { params: Params; searchParams: Promise<RawSearchParams> }) {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);
  if (!category) return null;
  const query = { ...parseCatalogSearchParams(raw), category: category.slug };
  return <CachedCatalogView basePath={`/category/${category.slug}`} query={query} omitCategory />;
}
