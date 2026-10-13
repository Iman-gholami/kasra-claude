"use client";

import type { ImageAsset, ProductColor, ProductVariant } from "@/types/catalog";
import { sizeLabel } from "@/data/sizes";
import { formatNumber } from "@/lib/persian";
import { uiActions } from "@/features/ui/ui-store";
import { cartActions } from "./cart-store";

export interface PurchasableProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  colors: ProductColor[];
  variants: ProductVariant[];
}

export type AddToCartOutcome = { ok: true; quantity: number } | { ok: false; reason: "missing-size" | "unavailable" };

/** Adds a selected variant to the cart and announces the result. */
export function addVariantToCart(
  product: PurchasableProduct,
  selection: { colorId: string; size: string | null; quantity: number; image: ImageAsset },
): AddToCartOutcome {
  if (!selection.size) return { ok: false, reason: "missing-size" };
  const variant = product.variants.find((v) => v.colorId === selection.colorId && v.size === selection.size);
  const color = product.colors.find((c) => c.id === selection.colorId);
  if (!variant || !color || variant.stock <= 0) return { ok: false, reason: "unavailable" };

  const result = cartActions.add(
    {
      sku: variant.sku,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: { src: selection.image.src, alt: selection.image.alt },
      colorId: color.id,
      colorName: color.name,
      colorHex: color.hex,
      size: variant.size,
      sizeLabel: sizeLabel(variant.size),
      unitPrice: product.price,
      compareAtPrice: product.compareAtPrice,
      maxQuantity: variant.stock,
    },
    selection.quantity,
  );

  uiActions.toast(
    result.capped
      ? `تعداد این مدل در سبد به حداکثر موجودی (${formatNumber(result.quantity)} عدد) رسید.`
      : `«${product.name}» به سبد خرید اضافه شد.`,
    { action: { href: "/cart", label: "مشاهده‌ی سبد" } },
  );
  return { ok: true, quantity: result.quantity };
}
