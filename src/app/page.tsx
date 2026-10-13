import { CategoryTiles } from "@/components/home/category-tiles";
import { CollectionBanner } from "@/components/home/collection-banner";
import { Hero } from "@/components/home/hero";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { ValueProps } from "@/components/home/value-props";
import { ProductGrid } from "@/components/products/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { getCategories, getFeaturedProducts, getNewArrivals } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";

export default async function HomePage() {
  const [categories, newArrivals] = await Promise.all([getCategories(), getNewArrivals(4)]);
  const featured = await getFeaturedProducts(4, newArrivals.map((p) => p.id));

  return (
    <>
      <Hero />
      <CategoryTiles categories={categories} />

      <section aria-labelledby="new-title" className="container-page pt-20 md:pt-28">
        <SectionHeading
          id="new-title"
          eyebrow="New in"
          title="تازه‌های کسرا"
          description="جدیدترین شومیزها، مانتوها و تیشرت‌هایی که به فروشگاه اضافه شده‌اند."
          link={{ href: "/shop?sort=newest", label: "مشاهده‌ی همه" }}
        />
        <ProductGrid products={newArrivals} columns="showcase" className="mt-8" />
      </section>

      <CollectionBanner />

      <section aria-labelledby="featured-title" className="container-page pt-20 md:pt-28">
        <SectionHeading
          id="featured-title"
          eyebrow="Kasra edit"
          title="منتخب کسرا"
          description="قطعه‌هایی که به‌راحتی با هم ست می‌شوند و پایه‌ی کمد هر روزت هستند."
          link={{ href: "/shop?sort=featured", label: "مشاهده‌ی همه" }}
        />
        <ProductGrid products={featured} columns="showcase" className="mt-8" />
      </section>

      <ValueProps />
      <NewsletterForm />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          url: siteConfig.url,
          inLanguage: "fa-IR",
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteConfig.url}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
    </>
  );
}
