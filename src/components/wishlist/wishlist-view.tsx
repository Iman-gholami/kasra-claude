"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProductSummary } from "@/types/catalog";
import { ProductGrid } from "@/components/products/product-grid";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useWishlistIds } from "@/features/wishlist/wishlist-store";
import { useHydrated } from "@/lib/store/create-store";
import { formatNumber } from "@/lib/persian";

/**
 * The wishlist stores product ids only; current product data (price, stock)
 * is fetched from the catalog API so saved items never show stale prices.
 */
export function WishlistView() {
  const hydrated = useHydrated();
  const ids = useWishlistIds();
  const [items, setItems] = useState<ProductSummary[] | null>(null);
  const [failed, setFailed] = useState(false);
  const missing = ids.filter((id) => !items?.some((p) => p.id === id));
  const fetchKey = missing.length ? [...ids].sort().join(",") : "";

  useEffect(() => {
    if (!fetchKey) return;
    const controller = new AbortController();
    fetch(`/api/products/summaries?ids=${encodeURIComponent(fetchKey)}`, { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<{ items: ProductSummary[] }>) : Promise.reject(new Error())))
      .then((data) => setItems(data.items))
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [fetchKey]);

  if (!hydrated || (ids.length && !items && !failed)) {
    return (
      <ul className="grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4" role="status" aria-label="در حال بارگذاری علاقه‌مندی‌ها">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i}>
            <div className="aspect-[3/4] animate-pulse rounded-xs bg-sand-soft" />
            <div className="mt-3 h-4 w-3/4 rounded-xs bg-sand-soft" />
          </li>
        ))}
      </ul>
    );
  }

  if (failed) {
    return <EmptyState title="بارگذاری علاقه‌مندی‌ها ممکن نشد" description="اتصال اینترنت را بررسی کنید و صفحه را دوباره باز کنید." />;
  }

  // Preserve the order in which items were saved (newest first).
  const visible = ids.flatMap((id) => items?.find((p) => p.id === id) ?? []);

  if (!visible.length) {
    return (
      <EmptyState
        icon={<Heart className="size-7" strokeWidth={1.5} />}
        title="فهرست علاقه‌مندی‌های شما خالی است"
        description="با زدن نماد قلب روی هر محصول، آن را برای بعد ذخیره کنید. این فهرست فقط در همین مرورگر نگه‌داری می‌شود."
        action={<ButtonLink href="/shop">مشاهده‌ی محصولات</ButtonLink>}
      />
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-ink-soft" aria-live="polite">
        {formatNumber(visible.length)} محصول ذخیره شده است.
      </p>
      <ProductGrid products={visible} columns="showcase" />
    </>
  );
}
