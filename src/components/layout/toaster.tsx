"use client";

import Link from "next/link";
import { CircleCheck, X } from "lucide-react";
import { uiActions, useUi } from "@/features/ui/ui-store";
import { cn } from "@/lib/cn";

/** Non-blocking notifications announced politely to assistive technology. */
export function Toaster() {
  const toasts = useUi((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:items-start md:px-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "pointer-events-auto flex w-full max-w-sm animate-toast-in items-center gap-3 rounded-md px-4 py-3 text-sm shadow-lift",
            t.tone === "error" ? "bg-danger text-white" : "bg-ink text-white",
          )}
        >
          <CircleCheck className="size-5 shrink-0 opacity-80" aria-hidden />
          <p className="flex-1 leading-6">{t.message}</p>
          {t.action ? (
            <Link
              href={t.action.href}
              onClick={() => uiActions.dismissToast(t.id)}
              className="shrink-0 font-semibold underline underline-offset-4"
            >
              {t.action.label}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => uiActions.dismissToast(t.id)}
            className="-me-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
            aria-label="بستن پیام"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
