"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useMemo } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useCartLines } from "@/features/cart/cart-store";
import { computeCartTotals } from "@/features/cart/totals";
import { useHydrated } from "@/lib/store/create-store";
import { formatNumber } from "@/lib/persian";
import { CartLineItem } from "./cart-line-item";
import { CartSummary, FreeShippingProgress } from "./cart-summary";

export function CartPageView() {
  const hydrated = useHydrated();
  const lines = useCartLines();
  const totals = useMemo(() => computeCartTotals(lines), [lines]);

  if (!hydrated) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]" role="status" aria-label="در حال بارگذاری سبد خرید">
        <div className="h-72 animate-pulse rounded-sm bg-sand-soft" />
        <div className="h-64 animate-pulse rounded-sm bg-sand-soft" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <EmptyState
        icon={<ShoppingBag className="size-7" strokeWidth={1.5} />}
        title="سبد خرید شما خالی است"
        description="هنوز محصولی به سبد اضافه نکرده‌اید. از میان شومیزها، مانتوها و تیشرت‌ها انتخاب کنید."
        action={
          <>
            <ButtonLink href="/shop">مشاهده‌ی محصولات</ButtonLink>
            <ButtonLink href="/wishlist" variant="secondary">
              علاقه‌مندی‌ها
            </ButtonLink>
          </>
        }
      />
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_26rem]">
      <section aria-labelledby="cart-items-title">
        <h2 id="cart-items-title" className="sr-only">
          کالاهای سبد خرید
        </h2>
        <FreeShippingProgress totals={totals} />
        <ul className="divide-y divide-line border-b border-line">
          {lines.map((line) => (
            <CartLineItem key={line.sku} line={line} />
          ))}
        </ul>
        <Link href="/shop" className="mt-6 inline-flex h-11 items-center gap-2 text-sm font-medium">
          <ArrowLeft className="size-4 rotate-180" aria-hidden />
          ادامه‌ی خرید
        </Link>
      </section>

      <aside aria-labelledby="cart-summary-title">
        <div className="rounded-sm border border-line bg-surface p-5 lg:sticky lg:top-24 lg:p-6">
          <h2 id="cart-summary-title" className="mb-5 text-base font-bold">
            خلاصه‌ی سبد <span className="text-sm font-normal text-ink-muted">({formatNumber(totals.itemCount)} کالا)</span>
          </h2>
          <CartSummary totals={totals} />
          <ButtonLink href="/checkout" size="lg" className="mt-6 w-full" data-testid="go-to-checkout">
            ادامه‌ی فرایند خرید
          </ButtonLink>
          <p className="mt-3 text-center text-xs leading-5 text-ink-muted">
            قیمت‌ها و هزینه‌ی ارسال نمونه هستند. در نسخه‌ی نهایی، قیمت و موجودی پیش از پرداخت دوباره بررسی می‌شود.
          </p>
        </div>
      </aside>
    </div>
  );
}
