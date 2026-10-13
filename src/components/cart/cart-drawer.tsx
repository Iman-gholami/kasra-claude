"use client";

import { ShoppingBag } from "lucide-react";
import { useMemo } from "react";
import { Drawer } from "@/components/ui/drawer";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useCartLines } from "@/features/cart/cart-store";
import { computeCartTotals } from "@/features/cart/totals";
import { uiActions, useUi } from "@/features/ui/ui-store";
import { formatNumber, formatToman } from "@/lib/persian";
import { CartLineItem } from "./cart-line-item";
import { FreeShippingProgress } from "./cart-summary";

export function CartDrawer() {
  const open = useUi((s) => s.cartOpen);
  const lines = useCartLines();
  const totals = useMemo(() => computeCartTotals(lines), [lines]);
  const close = uiActions.closeCart;

  return (
    <Drawer
      open={open}
      onClose={close}
      side="left"
      title={
        <>
          سبد خرید
          {totals.itemCount > 0 ? <span className="ms-2 text-sm font-normal text-ink-muted">({formatNumber(totals.itemCount)} کالا)</span> : null}
        </>
      }
      bodyClassName="px-5"
      footer={
        lines.length ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-base">
              <span className="text-ink-soft">جمع سبد</span>
              <span className="font-bold tabular-nums">{formatToman(totals.subtotal)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ButtonLink href="/cart" variant="secondary" onClick={close}>
                مشاهده‌ی سبد
              </ButtonLink>
              <ButtonLink href="/checkout" onClick={close}>
                ادامه‌ی خرید
              </ButtonLink>
            </div>
          </div>
        ) : null
      }
    >
      {lines.length ? (
        <>
          <div className="pt-4">
            <FreeShippingProgress totals={totals} />
          </div>
          <ul className="divide-y divide-line">
            {lines.map((line) => (
              <CartLineItem key={line.sku} line={line} onNavigate={close} />
            ))}
          </ul>
        </>
      ) : (
        <EmptyState
          icon={<ShoppingBag className="size-7" strokeWidth={1.5} />}
          title="سبد خرید شما خالی است"
          description="محصولات موردعلاقه‌تان را از فروشگاه انتخاب کنید."
          action={
            <ButtonLink href="/shop" onClick={close}>
              مشاهده‌ی محصولات
            </ButtonLink>
          }
        />
      )}
    </Drawer>
  );
}
