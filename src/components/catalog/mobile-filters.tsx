"use client";

import { LoaderCircle, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/persian";
import { FilterPanel, type FilterPanelProps } from "./filter-panel";
import { useCatalogTransition } from "./catalog-transition";

export function MobileFilters(props: Omit<FilterPanelProps, "idPrefix"> & { total: number; activeCount: number }) {
  const [open, setOpen] = useState(false);
  const { isPending } = useCatalogTransition();
  const { total, activeCount, ...panel } = props;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
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
          <Button size="lg" className="w-full" onClick={() => setOpen(false)} data-testid="apply-filters">
            {isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
            نمایش {formatNumber(total)} محصول
          </Button>
        }
      >
        <FilterPanel {...panel} idPrefix="mobile" />
      </Drawer>
    </>
  );
}
