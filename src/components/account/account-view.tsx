"use client";

import Link from "next/link";
import { Heart, Package, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { inputClasses } from "@/components/ui/field";
import { cartActions, useCartCount } from "@/features/cart/cart-store";
import { orderActions, useDemoOrders } from "@/features/orders/orders-store";
import { useWishlistCount, wishlistStore } from "@/features/wishlist/wishlist-store";
import { uiActions } from "@/features/ui/ui-store";
import { useHydrated } from "@/lib/store/create-store";
import { formatNumber, formatToman, toPersianDigits } from "@/lib/persian";
import { cn } from "@/lib/cn";

export function AccountView() {
  const hydrated = useHydrated();
  const orders = useDemoOrders();
  const wishlistCount = useWishlistCount();
  const cartCount = useCartCount();
  const [loginNotice, setLoginNotice] = useState(false);

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr] lg:gap-12">
      <section aria-labelledby="login-title" className="h-fit rounded-sm border border-line bg-surface p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="login-title" className="text-lg font-bold">
            ورود یا ثبت‌نام
          </h2>
          <DemoBadge>غیرفعال</DemoBadge>
        </div>
        <p className="mt-3 text-sm leading-7 text-ink-soft">
          ورود با شماره‌ی موبایل پس از اتصال سرویس احراز هویت فعال می‌شود. تا آن زمان خرید بدون ثبت‌نام امکان‌پذیر است.
        </p>
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setLoginNotice(true);
          }}
        >
          <label htmlFor="account-mobile" className="block text-sm font-medium">
            شماره‌ی موبایل
          </label>
          <input id="account-mobile" type="tel" dir="ltr" disabled placeholder="09123456789" className={cn(inputClasses, "h-12 text-right")} aria-describedby="login-status" />
          <Button type="submit" variant="secondary" className="w-full">
            دریافت کد ورود
          </Button>
          <p id="login-status" role="status" className="min-h-6 text-sm text-rose-deep">
            {loginNotice ? "احراز هویت هنوز متصل نیست؛ هیچ پیامکی ارسال نشد." : null}
          </p>
        </form>
      </section>

      <div className="space-y-8">
        <ul className="grid grid-cols-3 gap-3">
          {[
            { href: "/account#orders", label: "سفارش‌ها", count: orders.length, icon: Package },
            { href: "/wishlist", label: "علاقه‌مندی‌ها", count: wishlistCount, icon: Heart },
            { href: "/cart", label: "سبد خرید", count: cartCount, icon: ShoppingBag },
          ].map(({ href, label, count, icon: Icon }) => (
            <li key={label}>
              <Link href={href} className="flex h-full flex-col items-center gap-2 rounded-sm border border-line bg-surface p-4 text-center transition-colors hover:border-ink-muted">
                <Icon className="size-5 text-rose-deep" strokeWidth={1.6} aria-hidden />
                <span className="text-sm font-medium">{label}</span>
                <span className="text-lg font-bold tabular-nums">{hydrated ? formatNumber(count) : "–"}</span>
              </Link>
            </li>
          ))}
        </ul>

        <section aria-labelledby="orders-title" id="orders" className="scroll-mt-28">
          <h2 id="orders-title" className="text-lg font-bold">
            سفارش‌های آزمایشی
          </h2>
          <p className="mt-1 text-sm text-ink-soft">سفارش‌هایی که در این مرورگر با فرم نمایشی ثبت کرده‌اید.</p>
          {!hydrated ? (
            <div className="mt-5 h-24 animate-pulse rounded-sm bg-sand-soft" />
          ) : orders.length ? (
            <ul className="mt-5 divide-y divide-line rounded-sm border border-line bg-surface">
              {orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-semibold" dir="ltr">
                      {o.id}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {toPersianDigits(new Date(o.createdAt).toLocaleDateString("fa-IR"))} — {formatNumber(o.totals.itemCount)} کالا
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold tabular-nums">{formatToman(o.totals.total)}</span>
                    <Link href={`/checkout/confirmation?order=${o.id}`} className="text-sm text-rose-deep underline underline-offset-4">
                      جزئیات
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-sm border border-dashed border-line-strong p-6 text-center">
              <p className="text-sm text-ink-soft">هنوز سفارش آزمایشی ثبت نکرده‌اید.</p>
              <ButtonLink href="/shop" size="sm" className="mt-4">
                شروع خرید
              </ButtonLink>
            </div>
          )}
        </section>

        <section aria-labelledby="data-title" className="rounded-sm bg-sand-soft p-5">
          <h2 id="data-title" className="text-sm font-bold">
            داده‌های نمایشی این مرورگر
          </h2>
          <p className="mt-2 text-sm leading-7 text-ink-soft">
            سبد خرید، علاقه‌مندی‌ها و سفارش‌های آزمایشی فقط در حافظه‌ی همین مرورگر (localStorage) ذخیره می‌شوند و به هیچ سروری ارسال
            نمی‌شوند.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-danger"
            onClick={() => {
              cartActions.clear();
              orderActions.clear();
              wishlistStore.setState(() => ({ version: 1, ids: [] }));
              uiActions.toast("داده‌های نمایشی این مرورگر پاک شد.");
            }}
          >
            <Trash2 className="size-4" aria-hidden />
            پاک کردن همه‌ی داده‌های نمایشی
          </Button>
        </section>
      </div>
    </div>
  );
}
