"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { cartActions } from "@/features/cart/cart-store";
import type { CartLine } from "@/features/cart/types";
import { uiActions } from "@/features/ui/ui-store";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { formatNumber, formatToman } from "@/lib/persian";
import { demoCommerce } from "@/lib/site";

export function CartLineItem({ line, onNavigate }: { line: CartLine; onNavigate?: () => void }) {
  const href = `/product/${line.slug}?color=${line.colorId}`;
  const max = Math.min(line.maxQuantity, demoCommerce.maxQuantityPerLine);
  return (
    <li className="flex gap-4 py-5" data-testid="cart-line" data-sku={line.sku}>
      <Link href={href} onClick={onNavigate} className="relative block aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xs bg-sand-soft sm:w-24" tabIndex={-1} aria-hidden>
        <Image src={line.image.src} alt="" fill sizes="96px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} onClick={onNavigate} className="text-[0.9375rem] font-semibold leading-6 hover:underline hover:underline-offset-4">
            {line.name}
          </Link>
          <button
            type="button"
            onClick={() => {
              cartActions.remove(line.sku);
              uiActions.toast(`«${line.name}» از سبد خرید حذف شد.`);
            }}
            className="-mt-1.5 -me-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-sand-soft hover:text-danger"
            aria-label={`حذف ${line.name} از سبد خرید`}
          >
            <Trash2 className="size-[1.125rem]" aria-hidden />
          </button>
        </div>
        <p className="mt-1 flex items-center gap-2 text-[0.8125rem] text-ink-soft">
          <span className="inline-block size-3 rounded-full border border-black/15" style={{ backgroundColor: line.colorHex }} aria-hidden />
          <span>{line.colorName}</span>
          <span aria-hidden className="text-line-strong">|</span>
          <span>سایز {line.sizeLabel}</span>
        </p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
          <QuantityStepper
            size="sm"
            value={line.quantity}
            max={max}
            onChange={(q) => cartActions.setQuantity(line.sku, q)}
            label={`تعداد ${line.name}`}
          />
          <div className="text-end">
            {line.compareAtPrice ? (
              <del className="block text-xs text-ink-muted tabular-nums">{formatNumber(line.compareAtPrice * line.quantity)}</del>
            ) : null}
            <p className="text-[0.9375rem] font-bold tabular-nums" data-testid="line-total">
              {formatToman(line.unitPrice * line.quantity)}
            </p>
          </div>
        </div>
        {line.quantity >= max ? <p className="mt-2 text-xs text-ink-muted">حداکثر تعداد قابل سفارش برای این مدل انتخاب شده است.</p> : null}
      </div>
    </li>
  );
}
