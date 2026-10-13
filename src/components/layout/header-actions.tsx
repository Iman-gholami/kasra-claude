"use client";

import Link from "next/link";
import { Heart, Search, ShoppingBag, UserRound } from "lucide-react";
import { useCartCount } from "@/features/cart/cart-store";
import { useWishlistCount } from "@/features/wishlist/wishlist-store";
import { uiActions } from "@/features/ui/ui-store";
import { useHydrated } from "@/lib/store/create-store";
import { formatNumber } from "@/lib/persian";
import { cn } from "@/lib/cn";

const iconButton =
  "relative inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors duration-150 hover:bg-sand-soft active:bg-sand";

function CountBadge({ count, label }: { count: number; label: string }) {
  const hydrated = useHydrated();
  // Rendered only after hydration so persisted counts never flash from 0.
  if (!hydrated || count === 0) return null;
  return (
    <span
      className="absolute top-1 left-0.5 flex min-w-[1.125rem] animate-fade-in items-center justify-center rounded-full bg-rose-deep px-1 text-[0.625rem] font-bold leading-[1.125rem] text-white tabular-nums"
      aria-hidden
      data-testid={`${label}-count`}
    >
      {formatNumber(count)}
    </span>
  );
}

export function SearchTrigger({ variant = "icon" }: { variant?: "icon" | "field" }) {
  if (variant === "field") {
    return (
      <button
        type="button"
        onClick={uiActions.openSearch}
        className="flex h-10 w-full max-w-64 items-center gap-2 rounded-full border border-line bg-surface/70 px-4 text-sm text-ink-muted transition-colors hover:border-line-strong"
        aria-label="جستجوی محصولات"
        aria-haspopup="dialog"
      >
        <Search className="size-4" aria-hidden />
        <span>جستجو در کسرا…</span>
      </button>
    );
  }
  return (
    <button type="button" onClick={uiActions.openSearch} className={iconButton} aria-label="جستجوی محصولات" aria-haspopup="dialog">
      <Search className="size-[1.375rem]" strokeWidth={1.6} aria-hidden />
    </button>
  );
}

export function WishlistLink({ className }: { className?: string }) {
  const count = useWishlistCount();
  const hydrated = useHydrated();
  const label = hydrated && count > 0 ? `علاقه‌مندی‌ها، ${formatNumber(count)} مورد` : "علاقه‌مندی‌ها";
  return (
    <Link href="/wishlist" className={cn(iconButton, className)} aria-label={label} title="علاقه‌مندی‌ها">
      <Heart className="size-[1.375rem]" strokeWidth={1.6} aria-hidden />
      <CountBadge count={count} label="wishlist" />
    </Link>
  );
}

export function AccountLink({ className }: { className?: string }) {
  return (
    <Link href="/account" className={cn(iconButton, className)} aria-label="حساب کاربری" title="حساب کاربری">
      <UserRound className="size-[1.375rem]" strokeWidth={1.6} aria-hidden />
    </Link>
  );
}

export function CartTrigger() {
  const count = useCartCount();
  const hydrated = useHydrated();
  const label = hydrated && count > 0 ? `سبد خرید، ${formatNumber(count)} کالا` : "سبد خرید";
  return (
    <button type="button" onClick={uiActions.openCart} className={iconButton} aria-label={label} aria-haspopup="dialog" title="سبد خرید">
      <ShoppingBag className="size-[1.375rem]" strokeWidth={1.6} aria-hidden />
      <CountBadge count={count} label="cart" />
    </button>
  );
}
