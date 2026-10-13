import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { WishlistView } from "@/components/wishlist/wishlist-view";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "علاقه‌مندی‌ها", robots: PRIVATE_ROBOTS };

export default function WishlistPage() {
  return (
    <div className="container-page pt-5 md:pt-8">
      <PageHeader title="علاقه‌مندی‌ها" crumbs={[{ label: "علاقه‌مندی‌ها" }]} />
      <WishlistView />
    </div>
  );
}
