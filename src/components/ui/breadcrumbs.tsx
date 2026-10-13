import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { JsonLd } from "@/components/seo/json-ld";

export interface Crumb {
  href?: string;
  label: string;
}

/** Breadcrumb trail (RTL) with matching BreadcrumbList structured data. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ href: "/", label: "خانه" }, ...items];
  return (
    <>
      <nav aria-label="مسیر صفحه" className="text-[0.8125rem] text-ink-muted">
        <ol className="flex flex-wrap items-center gap-1">
          {trail.map((item, i) => {
            const last = i === trail.length - 1;
            return (
              <li key={`${item.label}-${i}`} className="flex items-center gap-1">
                {item.href && !last ? (
                  <Link href={item.href} className="rounded-xs py-1 transition-colors hover:text-ink">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined} className={last ? "text-ink" : undefined}>
                    {item.label}
                  </span>
                )}
                {!last ? <ChevronLeft className="size-3.5 opacity-60" aria-hidden /> : null}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            ...(item.href ? { item: `${siteConfig.url}${item.href}` } : {}),
          })),
        }}
      />
    </>
  );
}
