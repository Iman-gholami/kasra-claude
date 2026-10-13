import Link from "next/link";
import { cn } from "@/lib/cn";

/** Arch monogram — echoes the arched niches used across the brand imagery. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 30" className={cn("h-7 w-auto", className)} aria-hidden focusable="false">
      <path d="M2 29V12a10 10 0 0 1 20 0v17" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 29V13.5a5 5 0 0 1 10 0V29" fill="none" stroke="#B8847C" strokeWidth="1.6" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 rounded-xs", className)} aria-label="بوتیک کسرا — صفحه‌ی اصلی">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-[1.375rem] font-extrabold tracking-tight">کسرا</span>
        <span dir="ltr" className="mt-1 text-[0.5625rem] font-medium tracking-[0.32em] text-ink-muted">
          BOUTIQUE
        </span>
      </span>
    </Link>
  );
}
