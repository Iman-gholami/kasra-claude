import type { CartTotals } from "@/features/cart/types";
import { formatToman } from "@/lib/persian";
import { demoCommerce } from "@/lib/site";
import { cn } from "@/lib/cn";

interface CartSummaryProps {
  totals: CartTotals;
  shippingLabel?: string;
  className?: string;
}

/** Price breakdown shared by the cart drawer, cart page and checkout. */
export function CartSummary({ totals, shippingLabel = "هزینه‌ی ارسال (نمونه)", className }: CartSummaryProps) {
  return (
    <dl className={cn("space-y-2.5 text-sm", className)} data-testid="cart-summary">
      <div className="flex justify-between gap-4">
        <dt className="text-ink-soft">جمع کالاها</dt>
        <dd className="tabular-nums" data-testid="summary-original">{formatToman(totals.originalSubtotal)}</dd>
      </div>
      {totals.savings > 0 ? (
        <div className="flex justify-between gap-4 text-rose-deep">
          <dt>سود شما از تخفیف</dt>
          <dd className="tabular-nums" data-testid="summary-savings">{formatToman(totals.savings)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between gap-4">
        <dt className="text-ink-soft">{shippingLabel}</dt>
        <dd className="tabular-nums" data-testid="summary-shipping">{totals.shipping === 0 ? "رایگان" : formatToman(totals.shipping)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-line pt-3 text-base font-bold">
        <dt>مبلغ قابل پرداخت</dt>
        <dd className="tabular-nums" data-testid="summary-total">{formatToman(totals.total)}</dd>
      </div>
    </dl>
  );
}

export function FreeShippingProgress({ totals }: { totals: CartTotals }) {
  const threshold = demoCommerce.freeShippingThreshold;
  const progress = Math.min(100, Math.round((totals.subtotal / threshold) * 100));
  return (
    <div className="rounded-sm bg-sand-soft px-4 py-3">
      <p className="text-[0.8125rem] leading-6 text-ink-soft">
        {totals.freeShippingRemaining > 0 ? (
          <>
            <span className="font-semibold text-ink">{formatToman(totals.freeShippingRemaining)}</span> تا ارسال رایگان (قانون نمونه)
          </>
        ) : (
          <>ارسال این سفارش رایگان است (قانون نمونه).</>
        )}
      </p>
      <div
        className="mt-2 h-1 overflow-hidden rounded-full bg-sand"
        role="progressbar"
        aria-label="پیشرفت تا ارسال رایگان"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div className="h-full rounded-full bg-rose transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
