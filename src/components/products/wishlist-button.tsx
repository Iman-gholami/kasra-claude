"use client";

import { Heart } from "lucide-react";
import { useIsWishlisted, wishlistActions } from "@/features/wishlist/wishlist-store";
import { uiActions } from "@/features/ui/ui-store";
import { cn } from "@/lib/cn";

interface WishlistButtonProps {
  productId: string;
  productName: string;
  variant?: "overlay" | "outline";
  className?: string;
}

export function WishlistButton({ productId, productName, variant = "overlay", className }: WishlistButtonProps) {
  const saved = useIsWishlisted(productId);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `حذف ${productName} از علاقه‌مندی‌ها` : `افزودن ${productName} به علاقه‌مندی‌ها`}
      title={saved ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      data-testid="wishlist-toggle"
      onClick={() => {
        const nowSaved = wishlistActions.toggle(productId);
        uiActions.toast(nowSaved ? "به علاقه‌مندی‌ها اضافه شد." : "از علاقه‌مندی‌ها حذف شد.", {
          action: nowSaved ? { href: "/wishlist", label: "مشاهده" } : undefined,
        });
      }}
      className={cn(
        "inline-flex items-center justify-center transition-[background-color,color,transform] duration-150 active:scale-90",
        variant === "overlay"
          ? "size-10 rounded-full bg-surface/85 text-ink shadow-soft backdrop-blur-sm hover:bg-surface"
          : "size-12 rounded-sm border border-line-strong bg-surface hover:border-ink",
        className,
      )}
    >
      <Heart
        className={cn("size-5 transition-colors", saved ? "fill-rose-deep text-rose-deep" : "")}
        strokeWidth={1.7}
        aria-hidden
      />
    </button>
  );
}
