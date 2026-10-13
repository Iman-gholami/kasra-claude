"use client";

import { Check, CircleAlert, PackageCheck } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ProductPurchaseInfo } from "@/types/catalog";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { addVariantToCart } from "@/features/cart/add-to-cart";
import { demoCommerce } from "@/lib/site";
import { formatNumber } from "@/lib/persian";
import { cn } from "@/lib/cn";
import { useProductSelection } from "./product-selection";
import { SizeGuideButton } from "./size-guide-button";
import { VariantPicker, stockFor } from "./variant-picker";
import { WishlistButton } from "./wishlist-button";

interface ProductPurchaseProps {
  product: ProductPurchaseInfo;
  sizeGuide: ReactNode;
}

export function ProductPurchase({ product, sizeGuide }: ProductPurchaseProps) {
  const { colorId, setColorId } = useProductSelection();
  const [size, setSize] = useState<string | null>(() => (product.sizes.length === 1 ? product.sizes[0] : null));
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const sizeRef = useRef<HTMLFieldSetElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const soldOut = !product.variants.some((v) => v.stock > 0);
  const effectiveSize = size && stockFor(product.variants, colorId, size) > 0 ? size : null;
  const variantStock = effectiveSize ? stockFor(product.variants, colorId, effectiveSize) : 0;
  const maxQuantity = Math.max(1, Math.min(effectiveSize ? variantStock : demoCommerce.maxQuantityPerLine, demoCommerce.maxQuantityPerLine));
  const qty = Math.min(quantity, maxQuantity);

  // Reveal the compact sticky bar on phones once the main actions scroll away.
  useEffect(() => {
    const el = actionsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!justAdded) return;
    const t = window.setTimeout(() => setJustAdded(false), 2400);
    return () => window.clearTimeout(t);
  }, [justAdded]);

  const add = () => {
    const outcome = addVariantToCart(product, {
      colorId,
      size: effectiveSize,
      quantity: qty,
      image: product.colorImages[colorId] ?? product.image,
    });
    if (!outcome.ok) {
      setError(
        outcome.reason === "missing-size"
          ? "لطفاً پیش از افزودن به سبد، سایز موردنظر را انتخاب کنید."
          : "این ترکیب رنگ و سایز در حال حاضر موجود نیست.",
      );
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      sizeRef.current?.focus({ preventScroll: true });
      return;
    }
    setError(null);
    setJustAdded(true);
    setQuantity(1);
  };

  const addLabel = soldOut ? "ناموجود" : justAdded ? "به سبد اضافه شد" : "افزودن به سبد خرید";

  return (
    <div>
      <VariantPicker
        colors={product.colors}
        sizes={product.sizes}
        variants={product.variants}
        colorId={colorId}
        size={effectiveSize}
        onColorChange={(id) => {
          setColorId(id);
          setError(null);
        }}
        onSizeChange={(s) => {
          setSize(s);
          setError(null);
        }}
        sizeError={error}
        sizeGroupRef={sizeRef}
        sizeAction={<SizeGuideButton>{sizeGuide}</SizeGuideButton>}
      />

      <p className="mt-5 flex min-h-6 items-center gap-2 text-sm" aria-live="polite" data-testid="availability">
        {soldOut ? (
          <>
            <CircleAlert className="size-4 text-ink-muted" aria-hidden />
            <span className="text-ink-soft">این محصول در حال حاضر در هیچ رنگ و سایزی موجود نیست.</span>
          </>
        ) : effectiveSize ? (
          <>
            <PackageCheck className="size-4 text-success" aria-hidden />
            <span className="text-success">موجود</span>
            {variantStock <= demoCommerce.maxQuantityPerLine ? (
              <span className="text-ink-muted">— حداکثر {formatNumber(variantStock)} عدد قابل سفارش</span>
            ) : null}
          </>
        ) : (
          <span className="text-ink-muted">برای مشاهده‌ی موجودی، سایز را انتخاب کنید.</span>
        )}
      </p>

      <div ref={actionsRef} className="mt-5 flex items-stretch gap-3">
        {!soldOut ? (
          <QuantityStepper value={qty} max={maxQuantity} onChange={setQuantity} label="تعداد" className="hidden sm:inline-flex" />
        ) : null}
        <Button size="lg" className="flex-1" onClick={add} disabled={soldOut} data-testid="add-to-cart">
          {justAdded ? <Check className="size-5" aria-hidden /> : null}
          {addLabel}
        </Button>
        <WishlistButton productId={product.id} productName={product.name} variant="outline" />
      </div>
      {!soldOut ? (
        <div className="mt-3 sm:hidden">
          <QuantityStepper value={qty} max={maxQuantity} onChange={setQuantity} label="تعداد" />
        </div>
      ) : null}

      {/* Sticky mobile purchase bar (respects the home-indicator safe area). */}
      {!soldOut ? (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lift backdrop-blur transition-transform duration-200 lg:hidden",
            showSticky ? "translate-y-0" : "pointer-events-none translate-y-full",
          )}
          aria-hidden={!showSticky}
          inert={!showSticky}
        >
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-ink-soft">{product.name}</p>
              <Price price={product.price} compareAtPrice={product.compareAtPrice} showDiscount={false} />
            </div>
            <Button onClick={add} className="shrink-0" data-testid="sticky-add-to-cart">
              {justAdded ? <Check className="size-4" aria-hidden /> : null}
              {effectiveSize ? (justAdded ? "اضافه شد" : "افزودن به سبد") : "انتخاب سایز"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
