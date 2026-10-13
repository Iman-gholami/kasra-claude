import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogSkeleton } from "@/components/catalog/catalog-view";
import { SHOP_DESCRIPTION, ShopResults, ShopShell } from "@/components/catalog/catalog-page";
import { parseCatalogSearchParams, serializeCatalogQuery } from "@/lib/catalog/search-params";
import { robotsFor } from "@/lib/seo";

export async function generateMetadata({ searchParams }: PageProps<"/shop">): Promise<Metadata> {
  const query = parseCatalogSearchParams(await searchParams);
  return {
    title: "فروشگاه",
    description: SHOP_DESCRIPTION,
    alternates: { canonical: "/shop" },
    // Filtered, sorted and paginated permutations are noindex,follow.
    robots: robotsFor(serializeCatalogQuery(query) === ""),
  };
}

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <ShopShell>
      <Suspense fallback={<CatalogSkeleton />}>
        <ShopResults searchParams={searchParams} />
      </Suspense>
    </ShopShell>
  );
}
