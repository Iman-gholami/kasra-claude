import type { Metadata } from "next";
import { siteConfig } from "./site";

/**
 * Robots directives. Until a production launch explicitly enables indexing
 * (NEXT_PUBLIC_ALLOW_INDEXING=true) every page is noindex. Filtered, sorted,
 * paginated and search URLs are always noindex,follow so crawlers do not
 * index near-duplicate listing permutations.
 */
export function robotsFor(indexable: boolean): Metadata["robots"] {
  if (!siteConfig.allowIndexing) return { index: false, follow: false };
  return indexable ? { index: true, follow: true } : { index: false, follow: true };
}

export const PRIVATE_ROBOTS: Metadata["robots"] = { index: false, follow: false };
