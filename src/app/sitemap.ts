import type { MetadataRoute } from "next";
import { getCategories, getProductSlugs } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, slugs] = await Promise.all([getCategories(), getProductSlugs()]);
  const url = (path: string) => `${siteConfig.url}${path}`;
  return [
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    { url: url("/shop"), changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({ url: url(`/category/${c.slug}`), changeFrequency: "daily" as const, priority: 0.8 })),
    ...slugs.map((slug) => ({ url: url(`/product/${slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...["/about", "/faq", "/size-guide", "/contact"].map((p) => ({ url: url(p), changeFrequency: "monthly" as const, priority: 0.4 })),
  ];
}
