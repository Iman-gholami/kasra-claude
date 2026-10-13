import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("mx-auto flex max-w-md flex-col items-center px-4 py-14 text-center", className)}>
      {icon ? (
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-sand-soft text-ink-soft" aria-hidden>
          {icon}
        </div>
      ) : null}
      <h2 className="text-lg font-bold">{title}</h2>
      {description ? <p className="mt-2 text-[0.9375rem] leading-7 text-ink-soft">{description}</p> : null}
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}
