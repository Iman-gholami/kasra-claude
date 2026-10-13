import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CatalogSkeleton, CatalogView } from "@/components/catalog/catalog-view";
import { getCategories, getCategory, queryCatalog } from "@/lib/catalog";
import { parseCatalogSearchParams, serializeCatalogQuery } from "@/lib/catalog/search-params";
import { robotsFor } from "@/lib/seo";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);
  if (!category) return { title: "دسته‌بندی پیدا نشد" };
  const query = parseCatalogSearchParams(raw);
  return {
    title: `${category.name} زنانه`,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` },
    robots: robotsFor(serializeCatalogQuery(query, { omitCategory: true }) === ""),
    openGraph: { title: `${category.name} | بوتیک کسرا`, description: category.description, images: [category.image.src] },
  };
}

export default function CategoryPage({ params, searchParams }: PageProps<"/category/[slug]">) {
  return (
    <div className="container-page pt-5 md:pt-8">
      <Suspense fallback={<CategoryHeaderFallback />}>
        <CategoryHeader params={params} />
      </Suspense>
      <Suspense fallback={<CatalogSkeleton />}>
        <CategoryResults params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CategoryHeader({ params }: Pick<PageProps<"/category/[slug]">, "params">) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  return (
    <>
      <Breadcrumbs items={[{ href: "/shop", label: "فروشگاه" }, { label: category.name }]} />
      <header className="mt-6 mb-8 flex flex-col gap-3 md:mt-8 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow uppercase tracking-[0.2em]">
            <span dir="ltr">{category.latinName}</span>
          </p>
          <h1 className="mt-2 text-[1.75rem] font-extrabold tracking-tight md:text-4xl">{category.name}</h1>
          <p className="mt-3 leading-7 text-ink-soft">{category.description}</p>
        </div>
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

async function CategoryResults({ params, searchParams }: Pick<PageProps<"/category/[slug]">, "params" | "searchParams">) {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);
  if (!category) return null;
  const query = { ...parseCatalogSearchParams(raw), category: category.slug };
  const result = await queryCatalog(query);
  return <CatalogView basePath={`/category/${category.slug}`} query={query} result={result} omitCategory />;
}
