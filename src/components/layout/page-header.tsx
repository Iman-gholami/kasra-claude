import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";

export function PageHeader({ title, description, crumbs, children }: { title: string; description?: ReactNode; crumbs: Crumb[]; children?: ReactNode }) {
  return (
    <div className="mb-8 md:mb-12">
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-[1.75rem] font-extrabold tracking-tight md:mt-8 md:text-4xl">{title}</h1>
      {description ? <p className="mt-3 max-w-2xl leading-7 text-ink-soft">{description}</p> : null}
      {children}
    </div>
  );
}
