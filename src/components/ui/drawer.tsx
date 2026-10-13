"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Side = "right" | "left" | "bottom" | "center" | "sheet";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Visually hide the heading (it remains the dialog's accessible name). */
  hideTitle?: boolean;
  side?: Side;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
}

const panel: Record<Side, string> = {
  right:
    "fixed inset-y-0 right-0 left-auto h-dvh w-[min(26rem,100vw)] translate-x-full open:translate-x-0 starting:open:translate-x-full",
  left: "fixed inset-y-0 left-0 right-auto h-dvh w-[min(26rem,100vw)] -translate-x-full open:translate-x-0 starting:open:-translate-x-full",
  bottom:
    "fixed inset-x-0 bottom-0 top-auto max-h-[88dvh] w-full rounded-t-lg translate-y-full open:translate-y-0 starting:open:translate-y-full",
  /** Bottom sheet on phones, centred modal from the md breakpoint. */
  sheet:
    "fixed inset-x-0 bottom-0 top-auto max-h-[88dvh] w-full rounded-t-lg translate-y-full open:translate-y-0 starting:open:translate-y-full md:inset-0 md:m-auto md:h-fit md:w-[min(32rem,calc(100vw-2rem))] md:rounded-md md:translate-y-3 md:opacity-0 md:open:translate-y-0 md:open:opacity-100 md:starting:open:translate-y-3 md:starting:open:opacity-0",
  center:
    "fixed inset-0 m-auto h-fit max-h-[88dvh] w-[min(34rem,calc(100vw-2rem))] rounded-md opacity-0 scale-[0.98] open:opacity-100 open:scale-100 starting:open:opacity-0 starting:open:scale-[0.98]",
};

/**
 * Accessible drawer/modal built on the native <dialog> element: focus is
 * trapped and restored by the browser, Escape closes it and the page behind
 * becomes inert. Animations are pure CSS and respect reduced motion.
 */
export function Drawer({
  open,
  onClose,
  title,
  hideTitle,
  side = "right",
  children,
  footer,
  className,
  bodyClassName,
}: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Clicks on the ::backdrop target the dialog element itself.
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        // The dialog never scrolls itself; only the body region does.
        "z-50 m-0 flex-col overflow-hidden bg-surface text-ink shadow-lift outline-none open:flex",
        "transition-[translate,opacity,scale,display,overlay] transition-discrete duration-200 ease-out-soft",
        "backdrop:transition-[background-color,display,overlay] backdrop:transition-discrete backdrop:duration-200 starting:open:backdrop:bg-transparent",
        panel[side],
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-line px-5 py-3">
        <h2 id={titleId} className={cn("text-base font-bold", hideTitle && "sr-only")}>
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="-me-2 inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-sand-soft"
          aria-label="بستن"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", bodyClassName)}>{children}</div>
      {footer ? <div className="shrink-0 border-t border-line bg-surface px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div> : null}
    </dialog>
  );
}
