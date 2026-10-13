import { cn } from "@/lib/cn";

/** Marks a surface as demo-only so it is never mistaken for live functionality. */
export function DemoBadge({ children = "نمایشی", className }: { children?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs border border-dashed border-rose-deep/50 px-1.5 py-0.5 text-[0.6875rem] font-semibold leading-none text-rose-deep",
        className,
      )}
    >
      {children}
    </span>
  );
}
