import { formatNumber } from "@/lib/persian";
import { cn } from "@/lib/cn";

interface PriceProps {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
  showDiscount?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { price: "text-[0.9375rem]", compare: "text-xs", unit: "text-[0.6875rem]" },
  md: { price: "text-base", compare: "text-sm", unit: "text-xs" },
  lg: { price: "text-2xl", compare: "text-base", unit: "text-sm" },
};

/** Price with optional struck-through original price and discount percentage. */
export function Price({ price, compareAtPrice, size = "sm", showDiscount = true, className }: PriceProps) {
  const discounted = compareAtPrice !== undefined && compareAtPrice > price;
  const percent = discounted ? Math.round((1 - price / compareAtPrice) * 100) : 0;
  const s = sizeClasses[size];
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-bold tabular-nums", s.price, discounted && "text-rose-deep")} data-price={price}>
        {formatNumber(price)}
        <span className={cn("ms-1 font-normal text-ink-muted", s.unit)}>تومان</span>
      </span>
      {discounted ? (
        <>
          <span className="sr-only">قیمت قبلی:</span>
          <del className={cn("text-ink-muted tabular-nums decoration-ink-muted/60", s.compare)}>{formatNumber(compareAtPrice)}</del>
          {showDiscount ? (
            <span className={cn("rounded-xs bg-rose-soft px-1.5 py-0.5 font-semibold text-rose-deep", s.unit)}>
              {formatNumber(percent)}٪ تخفیف
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
