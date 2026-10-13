import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CartPageView } from "@/components/cart/cart-page-view";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "سبد خرید", robots: PRIVATE_ROBOTS };

export default function CartPage() {
  return (
    <div className="container-page pt-5 md:pt-8">
      <PageHeader title="سبد خرید" crumbs={[{ label: "سبد خرید" }]} />
      <CartPageView />
    </div>
  );
}
