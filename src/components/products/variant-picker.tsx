"use client";

import { useId, type Ref } from "react";
import type { ProductColor, ProductVariant } from "@/types/catalog";
import { sizeLabel } from "@/data/sizes";
import { cn } from "@/lib/cn";

interface VariantPickerProps {
  colors: ProductColor[];
  sizes: string[];
  variants: ProductVariant[];
  colorId: string;
  size: string | null;
  onColorChange: (colorId: string) => void;
  onSizeChange: (size: string) => void;
  sizeError?: string | null;
  sizeGroupRef?: Ref<HTMLFieldSetElement>;
  /** Extra control rendered next to the size legend (e.g. size guide trigger). */
  sizeAction?: React.ReactNode;
  compact?: boolean;
}

export function stockFor(variants: ProductVariant[], colorId: string, size: string) {
  return variants.find((v) => v.colorId === colorId && v.size === size)?.stock ?? 0;
}

/**
 * Colour and size selection built on native radio groups: arrow keys move
 * within a group, sold-out sizes are disabled, and errors are announced.
 */
export function VariantPicker({
  colors,
  sizes,
  variants,
  colorId,
  size,
  onColorChange,
  onSizeChange,
  sizeError,
  sizeGroupRef,
  sizeAction,
  compact,
}: VariantPickerProps) {
  const name = useId();
  const errorId = useId();
  const selectedColor = colors.find((c) => c.id === colorId);
  const colorAvailable = (id: string) => variants.some((v) => v.colorId === id && v.stock > 0);
  const anySizeAvailable = sizes.some((s) => stockFor(variants, colorId, s) > 0);

  return (
    <div className={cn("space-y-6", compact && "space-y-5")}>
      <fieldset>
        <legend className="mb-3 text-sm">
          <span className="font-semibold">رنگ:</span> <span className="text-ink-soft">{selectedColor?.name}</span>
          {selectedColor && !colorAvailable(selectedColor.id) ? <span className="ms-1 text-ink-muted">(ناموجود)</span> : null}
        </legend>
        <div className="flex flex-wrap gap-2.5">
          {colors.map((color) => {
            const available = colorAvailable(color.id);
            return (
              <label key={color.id} className="relative cursor-pointer" title={color.name}>
                <input
                  type="radio"
                  name={`${name}-color`}
                  value={color.id}
                  checked={color.id === colorId}
                  onChange={() => onColorChange(color.id)}
                  className="peer sr-only"
                  aria-label={available ? color.name : `${color.name} (ناموجود)`}
                  data-testid={`color-${color.id}`}
                />
                <span
                  className={cn(
                    "block size-10 rounded-full border border-black/15 ring-offset-2 ring-offset-surface transition-shadow peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ink",
                    !available && "opacity-55",
                  )}
                  style={{ backgroundColor: color.hex }}
                  aria-hidden
                />
                {!available ? (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
                    <span className="h-px w-11 rotate-45 bg-ink/70" />
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset ref={sizeGroupRef} tabIndex={-1} aria-describedby={sizeError ? errorId : undefined} className="relative outline-none">
        <legend className="mb-3 flex min-h-7 items-center text-sm">
          <span className="font-semibold">سایز:</span>
          <span className="ms-1 text-ink-soft">{size ? sizeLabel(size) : "انتخاب کنید"}</span>
        </legend>
        {sizeAction ? <div className="absolute top-0 left-0">{sizeAction}</div> : null}
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => {
            const stock = stockFor(variants, colorId, s);
            const disabled = stock <= 0;
            return (
              <label key={s} className={cn("relative", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
                <input
                  type="radio"
                  name={`${name}-size`}
                  value={s}
                  checked={s === size}
                  disabled={disabled}
                  onChange={() => onSizeChange(s)}
                  className="peer sr-only"
                  aria-label={disabled ? `سایز ${sizeLabel(s)} (ناموجود)` : `سایز ${sizeLabel(s)}`}
                  aria-invalid={sizeError ? true : undefined}
                  data-testid={`size-${s}`}
                />
                <span
                  className={cn(
                    "flex h-11 min-w-12 items-center justify-center rounded-sm border px-3 text-sm font-medium tabular-nums transition-colors",
                    "border-line-strong bg-surface peer-hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white",
                    "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink",
                    "peer-disabled:border-line peer-disabled:bg-sand-soft peer-disabled:text-ink-muted peer-disabled:line-through peer-disabled:peer-hover:border-line",
                    sizeError && "border-danger",
                  )}
                  aria-hidden
                >
                  {sizeLabel(s)}
                </span>
              </label>
            );
          })}
        </div>
        {sizeError ? (
          <p id={errorId} role="alert" className="mt-2.5 text-sm font-medium text-danger">
            {sizeError}
          </p>
        ) : !anySizeAvailable ? (
          <p className="mt-2.5 text-sm text-ink-soft">این رنگ در حال حاضر در هیچ سایزی موجود نیست. رنگ دیگری را امتحان کنید.</p>
        ) : null}
      </fieldset>
    </div>
  );
}
