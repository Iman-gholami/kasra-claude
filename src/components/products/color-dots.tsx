import type { ProductColor } from "@/types/catalog";
import { formatNumber } from "@/lib/persian";

/** Compact colour indicators for product cards. */
export function ColorDots({ colors, max = 4 }: { colors: ProductColor[]; max?: number }) {
  const shown = colors.slice(0, max);
  const extra = colors.length - shown.length;
  return (
    <div className="flex items-center gap-1.5">
      <span className="sr-only">رنگ‌های موجود: {colors.map((c) => c.name).join("، ")}</span>
      <ul className="flex items-center gap-1.5" aria-hidden>
        {shown.map((c) => (
          <li key={c.id} className="size-3.5 rounded-full border border-black/15 ring-1 ring-white ring-inset" style={{ backgroundColor: c.hex }} title={c.name} />
        ))}
      </ul>
      {extra > 0 ? (
        <span className="text-[0.6875rem] text-ink-muted" aria-hidden>
          +{formatNumber(extra)}
        </span>
      ) : null}
    </div>
  );
}
