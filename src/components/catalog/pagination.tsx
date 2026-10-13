import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CatalogQuery } from "@/types/catalog";
import { catalogHref } from "@/lib/catalog/search-params";
import { formatNumber } from "@/lib/persian";
import { cn } from "@/lib/cn";

interface PaginationProps {
  basePath: string;
  query: CatalogQuery;
  page: number;
  pageCount: number;
  omitCategory?: boolean;
}

function pageWindow(page: number, count: number): (number | "gap")[] {
  const pages = new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

/** Link-based pagination: crawlable, shareable and works with back/forward. */
export function Pagination({ basePath, query, page, pageCount, omitCategory }: PaginationProps) {
  if (pageCount <= 1) return null;
  const href = (p: number) => catalogHref(basePath, { ...query, page: p }, { omitCategory });
  const item = "inline-flex h-11 min-w-11 items-center justify-center rounded-sm px-3 text-sm tabular-nums transition-colors";
  return (
    <nav aria-label="صفحه‌بندی محصولات" className="mt-14 flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cn(item, "gap-1 hover:bg-sand-soft")} rel="prev">
          <ChevronRight className="size-4" aria-hidden /> قبلی
        </Link>
      ) : null}
      <ol className="flex items-center gap-1">
        {pageWindow(page, pageCount).map((p, i) =>
          p === "gap" ? (
            <li key={`gap-${i}`} aria-hidden className="px-1 text-ink-muted">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={href(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`صفحه‌ی ${formatNumber(p)}`}
                className={cn(item, p === page ? "bg-ink font-semibold text-white" : "hover:bg-sand-soft")}
              >
                {formatNumber(p)}
              </Link>
            </li>
          ),
        )}
      </ol>
      {page < pageCount ? (
        <Link href={href(page + 1)} className={cn(item, "gap-1 hover:bg-sand-soft")} rel="next" data-testid="next-page">
          بعدی <ChevronLeft className="size-4" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
