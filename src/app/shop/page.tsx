import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CatalogSkeleton, CatalogView } from "@/components/catalog/catalog-view";
import { queryCatalog } from "@/lib/catalog";
import { parseCatalogSearchParams, serializeCatalogQuery } from "@/lib/catalog/search-params";
import { robotsFor } from "@/lib/seo";

const description = "همه‌ی شومیزها، مانتوها و تیشرت‌های بوتیک کسرا با امکان فیلتر بر اساس سایز، رنگ، قیمت و موجودی.";

export async function generateMetadata({ searchParams }: PageProps<"/shop">): Promise<Metadata> {
  const query = parseCatalogSearchParams(await searchParams);
  return {
    title: "فروشگاه",
    description,
    alternates: { canonical: "/shop" },
    robots: robotsFor(serializeCatalogQuery(query) === ""),
  };
}

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <div className="container-page pt-5 md:pt-8">
      <Breadcrumbs items={[{ label: "فروشگاه" }]} />
      <header className="mt-6 mb-8 max-w-2xl md:mt-8 md:mb-10">
        <h1 className="text-[1.75rem] font-extrabold tracking-tight md:text-4xl">همه‌ی محصولات</h1>
        <p className="mt-3 leading-7 text-ink-soft">{description}</p>
      </header>
      <Suspense fallback={<CatalogSkeleton />}>
        <ShopResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ShopResults({ searchParams }: Pick<PageProps<"/shop">, "searchParams">) {
  const query = parseCatalogSearchParams(await searchParams);
  const result = await queryCatalog(query);
  return <CatalogView basePath="/shop" query={query} result={result} showCategories />;
}
