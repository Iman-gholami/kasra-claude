"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CircleCheck, PackageSearch } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { CartSummary } from "@/components/cart/cart-summary";
import { DemoBadge } from "@/components/ui/demo-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useDemoOrders } from "@/features/orders/orders-store";
import { useHydrated } from "@/lib/store/create-store";
import { formatNumber, toPersianDigits } from "@/lib/persian";

export function ConfirmationView() {
  const hydrated = useHydrated();
  const orderId = useSearchParams().get("order");
  const orders = useDemoOrders();
  const order = orders.find((o) => o.id === orderId);

  if (!hydrated) return <div className="h-96 animate-pulse rounded-sm bg-sand-soft" role="status" aria-label="در حال بارگذاری" />;

  if (!order) {
    return (
      <EmptyState
        icon={<PackageSearch className="size-7" strokeWidth={1.5} />}
        title="سفارشی با این شناسه پیدا نشد"
        description="سفارش‌های آزمایشی فقط در همان مرورگری که ثبت شده‌اند نگه‌داری می‌شوند."
        action={
          <>
            <ButtonLink href="/account">سفارش‌های من</ButtonLink>
            <ButtonLink href="/shop" variant="secondary">
              ادامه‌ی خرید
            </ButtonLink>
          </>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl" data-testid="order-confirmation">
      <div className="text-center">
        <CircleCheck className="mx-auto size-14 text-success" strokeWidth={1.4} aria-hidden />
        <DemoBadge className="mt-5">سفارش آزمایشی</DemoBadge>
        <h1 className="mt-3 text-2xl font-extrabold md:text-3xl">سفارش آزمایشی شما ثبت شد</h1>
        <p className="mt-3 leading-8 text-ink-soft">
          {order.customerName} عزیز، این یک نمایش از فرایند خرید است. هیچ پرداختی انجام نشده، هیچ سفارش واقعی به فروشگاه ارسال
          نشده و کالایی ارسال نخواهد شد.
        </p>
        <p className="mt-5 inline-flex items-center gap-2 rounded-sm bg-sand-soft px-4 py-2 text-sm">
          شناسه‌ی سفارش آزمایشی:
          <span dir="ltr" className="font-bold tracking-wider" data-testid="order-id">
            {order.id}
          </span>
        </p>
      </div>

      <section aria-labelledby="order-items-title" className="mt-10 rounded-sm border border-line bg-surface p-5 md:p-6">
        <h2 id="order-items-title" className="text-base font-bold">
          اقلام سفارش
        </h2>
        <ul className="mt-4 divide-y divide-line">
          {order.lines.map((line) => (
            <li key={line.sku} className="flex gap-3 py-3">
              <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-xs bg-sand-soft">
                <Image src={line.image.src} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium">{line.name}</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {line.colorName}، سایز {line.sizeLabel} — {formatNumber(line.quantity)} عدد
                </p>
              </div>
              <p className="shrink-0 text-sm tabular-nums">{formatNumber(line.unitPrice * line.quantity)}</p>
            </li>
          ))}
        </ul>
        <CartSummary totals={order.totals} shippingLabel={`ارسال: ${order.shippingMethod} (نمونه)`} className="mt-4 border-t border-line pt-4" />
        <p className="mt-4 text-sm text-ink-soft">
          مقصد: {order.province}، {order.city} — ثبت‌شده در {toPersianDigits(new Date(order.createdAt).toLocaleDateString("fa-IR"))}
        </p>
      </section>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/shop">ادامه‌ی خرید</ButtonLink>
        <ButtonLink href="/account" variant="secondary">
          سفارش‌های آزمایشی من
        </ButtonLink>
      </div>
    </div>
  );
}
