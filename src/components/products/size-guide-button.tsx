"use client";

import { Ruler } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Drawer } from "@/components/ui/drawer";

/** Opens server-rendered size guide content in a sheet. */
export function SizeGuideButton({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="inline-flex min-h-7 items-center gap-1.5 text-[0.8125rem] font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
      >
        <Ruler className="size-4" aria-hidden />
        راهنمای سایز
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} side="sheet" title="راهنمای سایز" bodyClassName="px-5 py-5">
        {children}
      </Drawer>
    </>
  );
}
