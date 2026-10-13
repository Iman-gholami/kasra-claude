"use client";

import { useRouter } from "next/navigation";
import { createContext, use, useTransition, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CatalogTransition {
  isPending: boolean;
  navigate: (href: string, beforeNavigate?: () => void) => void;
}

const Context = createContext<CatalogTransition | null>(null);

/**
 * Shares one navigation transition between filters, sorting and the results
 * region so the current results stay visible (dimmed) while the next page of
 * server-filtered results streams in.
 */
export function CatalogTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const navigate: CatalogTransition["navigate"] = (href, beforeNavigate) => {
    startTransition(() => {
      beforeNavigate?.();
      router.push(href, { scroll: false });
    });
  };
  return <Context value={{ isPending, navigate }}>{children}</Context>;
}

export function useCatalogTransition(): CatalogTransition {
  const ctx = use(Context);
  if (!ctx) throw new Error("useCatalogTransition must be used inside CatalogTransitionProvider");
  return ctx;
}

export function CatalogResultsRegion({ children, className }: { children: ReactNode; className?: string }) {
  const { isPending } = useCatalogTransition();
  return (
    <div
      aria-busy={isPending}
      data-pending={isPending || undefined}
      className={cn("transition-opacity duration-200", isPending && "pointer-events-none opacity-55 delay-100", className)}
    >
      {children}
    </div>
  );
}
