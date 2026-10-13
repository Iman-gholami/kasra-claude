import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Highlighted note used to flag sample or provisional content. */
export function Notice({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-3 rounded-sm border border-dashed border-rose-deep/40 bg-rose-soft/50 p-4 text-sm leading-7", className)} role="note">
      <Info className="mt-1 size-4 shrink-0 text-rose-deep" aria-hidden />
      <div>
        {title ? <p className="font-semibold text-ink">{title}</p> : null}
        <div className="text-ink-soft">{children}</div>
      </div>
    </div>
  );
}
