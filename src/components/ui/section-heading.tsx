import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  link?: { href: string; label: string };
  id?: string;
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, link, id, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex items-end justify-between gap-6", className)}>
      <div className="max-w-xl">
        {eyebrow ? (
          <p className="eyebrow mb-2 uppercase tracking-[0.18em]">
            <span dir="ltr">{eyebrow}</span>
          </p>
        ) : null}
        <h2 id={id} className="text-2xl font-bold leading-snug tracking-tight md:text-[1.75rem]">
          {title}
        </h2>
        {description ? <p className="mt-2 text-[0.9375rem] leading-7 text-ink-soft">{description}</p> : null}
      </div>
      {link ? (
        <Link
          href={link.href}
          className="group inline-flex shrink-0 items-center gap-1.5 py-2 text-sm font-medium text-ink underline-offset-8 hover:underline"
        >
          {link.label}
          <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
