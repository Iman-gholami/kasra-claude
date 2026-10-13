"use client";

import Image from "next/image";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ProductPurchaseInfo } from "@/types/catalog";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { addVariantToCart } from "@/features/cart/add-to-cart";
import { VariantPicker, stockFor } from "./variant-picker";

const cache = new Map<string, ProductPurchaseInfo>();

export default function QuickAddDialog({ slug, open, onClose }: { slug: string; open: boolean; onClose: () => void }) {
  const [info, setInfo] = useState<ProductPurchaseInfo | null>(() => cache.get(slug) ?? null);
  const [failed, setFailed] = useState(false);
  const [colorId, setColorId] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sizeRef = useRef<HTMLFieldSetElement>(null);

  useEffect(() => {
    if (info || !open) return;
    const controller = new AbortController();
    fetch(`/api/products/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<ProductPurchaseInfo>) : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        cache.set(slug, data);
        setInfo(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [slug, open, info]);

  const effectiveColor =
    colorId ?? info?.colors.find((c) => info.variants.some((v) => v.colorId === c.id && v.stock > 0))?.id ?? info?.colors[0]?.id ?? "";
  // A single available size (e.g. free size) is pre-selected.
  const availableSizes = info ? info.sizes.filter((s) => stockFor(info.variants, effectiveColor, s) > 0) : [];
  const effectiveSize = size ?? (info?.sizes.length === 1 && availableSizes.length === 1 ? availableSizes[0] : null);

  const submit = () => {
    if (!info) return;
    const outcome = addVariantToCart(info, {
      colorId: effectiveColor,
      size: effectiveSize,
      quantity: 1,
      image: info.colorImages[effectiveColor] ?? info.image,
    });
    if (!outcome.ok) {
      setError(outcome.reason === "missing-size" ? "لطفاً سایز را انتخاب کنید." : "این ترکیب رنگ و سایز موجود نیست.");
      sizeRef.current?.focus();
      return;
    }
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="sheet"
      title="افزودن سریع به سبد"
      bodyClassName="px-5 py-5"
      footer={
        info ? (
          <Button size="lg" className="w-full" onClick={submit} data-testid="quick-add-submit">
            افزودن به سبد خرید
          </Button>
        ) : null
      }
    >
      {info ? (
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xs bg-sand-soft">
              <Image src={(info.colorImages[effectiveColor] ?? info.image).src} alt="" fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold leading-7">{info.name}</p>
              <Price price={info.price} compareAtPrice={info.compareAtPrice} className="mt-1" />
              <Link href={`/product/${info.slug}`} onClick={onClose} className="mt-2 inline-block text-sm text-ink-soft underline underline-offset-4 hover:text-ink">
                مشاهده‌ی جزئیات محصول
              </Link>
            </div>
          </div>
          <VariantPicker
            compact
            colors={info.colors}
            sizes={info.sizes}
            variants={info.variants}
            colorId={effectiveColor}
            size={effectiveSize}
            onColorChange={(id) => {
              setColorId(id);
              if (effectiveSize && stockFor(info.variants, id, effectiveSize) <= 0) setSize(null);
              setError(null);
            }}
            onSizeChange={(s) => {
              setSize(s);
              setError(null);
            }}
            sizeError={error}
            sizeGroupRef={sizeRef}
          />
        </div>
      ) : failed ? (
        <p className="py-6 text-center text-sm text-ink-soft">بارگذاری اطلاعات محصول ممکن نشد. لطفاً دوباره تلاش کنید.</p>
      ) : (
        <div className="flex justify-center py-10" role="status" aria-label="در حال بارگذاری">
          <LoaderCircle className="size-6 animate-spin text-ink-muted" aria-hidden />
        </div>
      )}
    </Drawer>
  );
}
