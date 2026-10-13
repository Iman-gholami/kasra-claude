import type { Metadata } from "next";
import { CategoryResults, CategoryShell } from "@/components/catalog/catalog-page";
import { getCategories, getCategory } from "@/lib/catalog";
import { parseCatalogSearchParams, serializeCatalogQuery } from "@/lib/catalog/search-params";
import { robotsFor } from "@/lib/seo";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);
  if (!category) return { title: "دسته‌بندی پیدا نشد" };
  const query = parseCatalogSearchParams(raw);
  return {
    title: `${category.name} زنانه`,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` },
    robots: robotsFor(serializeCatalogQuery(query, { omitCategory: true }) === ""),
    openGraph: { title: `${category.name} | بوتیک کسرا`, description: category.description, images: [category.image.src] },
  };
}

export default function CategoryPage({ params, searchParams }: PageProps<"/category/[slug]">) {
  return (
    <CategoryShell params={params}>
      <CategoryResults params={params} searchParams={searchParams} />
    </CategoryShell>
  );
}
