"use client";

import { LoaderCircle, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import type { CatalogFacets, CatalogQuery } from "@/types/catalog";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { catalogHref, hasActiveRefinements, serializeCatalogQuery } from "@/lib/catalog/search-params";
import { formatNumber } from "@/lib/persian";
import { FilterControls, type FilterPanelProps } from "./filter-panel";
import { useCatalogTransition } from "./catalog-transition";

/**
 * Phone filter sheet. Selections are collected as a draft with a live result
 * count, then applied in one navigation — fewer round trips on mobile
 * networks and no page change while the sheet is open.
 */
export function MobileFilters(props: Omit<FilterPanelProps, "idPrefix"> & { total: number; activeCount: number }) {
  const { basePath, query, facets, omitCategory, showCategories, total, activeCount } = props;
  const { navigate } = useCatalogTransition();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CatalogQuery>(query);
  const [preview, setPreview] = useState<{ key: string; total: number; facets: CatalogFacets } | null>(null);

  const draftKey = serializeCatalogQuery({ ...draft, page: undefined });
  const currentKey = serializeCatalogQuery({ ...query, page: undefined });
  const dirty = draftKey !== currentKey;
  const previewReady = !dirty || preview?.key === draftKey;
  const shownTotal = !dirty ? total : preview?.key === draftKey ? preview.total : null;

  useEffect(() => {
    if (!open || !dirty) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`/api/catalog/summary?${draftKey}`, { signal: controller.signal })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((data: { total: number; facets: CatalogFacets }) => setPreview({ key: draftKey, ...data }))
        .catch(() => {});
    }, 150);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, dirty, draftKey]);

  const show = () => {
    setDraft(query);
    setOpen(true);
  };
  const apply = () => {
    setOpen(false);
    if (dirty) navigate(catalogHref(basePath, { ...draft, page: undefined }, { omitCategory }));
  };

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        className="inline-flex h-11 items-center gap-2 rounded-sm border border-line-strong bg-surface px-4 text-sm font-medium transition-colors hover:border-ink lg:hidden"
        data-testid="open-filters"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        فیلترها
        {activeCount > 0 ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-ink text-[0.6875rem] text-white">{formatNumber(activeCount)}</span>
        ) : null}
      </button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side="right"
        title="فیلتر محصولات"
        bodyClassName="px-5 pt-5"
        footer={
          <div className="flex gap-2">
            {hasActiveRefinements(draft) ? (
              <Button variant="secondary" size="lg" className="shrink-0" onClick={() => setDraft({ category: draft.category, q: draft.q, sort: draft.sort })}>
                حذف همه
              </Button>
            ) : null}
            <Button size="lg" className="flex-1" onClick={apply} disabled={shownTotal === 0} data-testid="apply-filters" aria-live="polite">
              {!previewReady ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
              {shownTotal === null ? "نمایش محصولات" : shownTotal === 0 ? "محصولی پیدا نشد" : `نمایش ${formatNumber(shownTotal)} محصول`}
            </Button>
          </div>
        }
      >
        {/* Rendered only while open: keeps the server HTML free of a second filter panel. */}
        {open ? (
          <FilterControls
            value={draft}
            facets={dirty && preview?.key === draftKey ? preview.facets : facets}
            showCategories={showCategories}
            idPrefix="mobile"
            onChange={setDraft}
          />
        ) : null}
      </Drawer>
    </>
  );
}
