import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import type { Product } from "@/types/catalog";

function Section({ title, children, defaultOpen }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group border-b border-line" open={defaultOpen}>
      <summary className="flex min-h-14 items-center justify-between gap-4 py-4 text-[0.9375rem] font-semibold">
        {title}
        <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden />
      </summary>
      <div className="pb-5 text-sm leading-7 text-ink-soft">{children}</div>
    </details>
  );
}

/** Product information in native disclosure widgets — accessible and zero-JS. */
export function ProductDetails({ product }: { product: Product }) {
  return (
    <div className="border-t border-line">
      <Section title="توضیحات محصول" defaultOpen>
        <p>{product.description}</p>
      </Section>
      <Section title="جنس و مشخصات">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          <dt className="text-ink-muted">جنس پارچه</dt>
          <dd className="text-ink">{product.material}</dd>
          {product.fit ? (
            <>
              <dt className="text-ink-muted">فرم</dt>
              <dd className="text-ink">{product.fit}</dd>
            </>
          ) : null}
          {product.attributes.map((a) => (
            <div key={a.label} className="contents">
              <dt className="text-ink-muted">{a.label}</dt>
              <dd className="text-ink">{a.value}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section title="راهنمای نگهداری">
        <ul className="list-disc space-y-1 ps-5">
          {product.care.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </Section>
      <Section title="ارسال و مرجوعی">
        <p>
          شرایط ارسال و مرجوعی در این نسخه‌ی نمایشی نمونه است و پس از تعیین سیاست‌های رسمی فروشگاه به‌روزرسانی می‌شود.{" "}
          <Link href="/shipping-and-returns" className="text-rose-deep underline underline-offset-4">
            مشاهده‌ی شرایط نمونه
          </Link>
        </p>
      </Section>
    </div>
  );
}
