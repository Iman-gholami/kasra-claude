"use client";

import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

// The quick-add sheet (and its variant data) is loaded only when requested.
const QuickAddDialog = dynamic(() => import("./quick-add-dialog"), { ssr: false });

export function QuickAddButton({ slug, productName, className }: { slug: string; productName: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setRequested(true);
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-label={`افزودن سریع ${productName} به سبد`}
        title="افزودن سریع"
        data-testid="quick-add"
        className={cn(
          "inline-flex h-10 items-center gap-1 rounded-full bg-surface/90 px-3 text-xs font-semibold text-ink shadow-soft backdrop-blur-sm transition-[background-color,transform] duration-150 hover:bg-surface active:scale-95",
          className,
        )}
      >
        <Plus className="size-4" aria-hidden />
        <span className="hidden sm:inline">افزودن</span>
      </button>
      {requested ? <QuickAddDialog slug={slug} open={open} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
