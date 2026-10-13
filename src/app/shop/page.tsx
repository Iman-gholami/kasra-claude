import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogSkeleton } from "@/components/catalog/catalog-view";
import { SHOP_DESCRIPTION, ShopResults, ShopShell } from "@/components/catalog/catalog-page";
import { robotsFor } from "@/lib/seo";

// Static metadata (rendered in <head>). Filtered/sorted/paginated permutations
// receive `X-Robots-Tag: noindex, follow` from next.config.ts.
export const metadata: Metadata = {
  title: "فروشگاه",
  description: SHOP_DESCRIPTION,
  alternates: { canonical: "/shop" },
  robots: robotsFor(true),
};

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <ShopShell>
      <Suspense fallback={<CatalogSkeleton />}>
        <ShopResults searchParams={searchParams} />
      </Suspense>
    </ShopShell>
  );
}
