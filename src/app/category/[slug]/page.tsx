import type { Metadata } from "next";
import { CategoryResults, CategoryShell } from "@/components/catalog/catalog-page";
import { getCategories, getCategory } from "@/lib/catalog";
import { robotsFor } from "@/lib/seo";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

// Depends on params only, so it is prerendered into <head>. Filtered
// permutations receive `X-Robots-Tag: noindex, follow` from next.config.ts.
export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "دسته‌بندی پیدا نشد" };
  return {
    title: `${category.name} زنانه`,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` },
    robots: robotsFor(true),
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
