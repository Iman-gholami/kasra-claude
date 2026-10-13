import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Price } from "@/components/ui/price";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductDetails } from "@/components/products/product-details";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductPurchase } from "@/components/products/product-purchase";
import { ProductSelectionProvider } from "@/components/products/product-selection";
import { SizeGuideNote, SizeGuideTable } from "@/components/products/size-guide-table";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategory, getProduct, getProductSlugs, getPurchaseInfo, getRelatedProducts } from "@/lib/catalog";
import { robotsFor } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "محصول پیدا نشد" };
  const image = product.images[0];
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}` },
    robots: robotsFor(true),
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }],
    },
  };
}

export default function ProductPage({ params }: PageProps<"/product/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: Pick<PageProps<"/product/[slug]">, "params">) {
  const { slug } = await params;
  const [product, purchase] = await Promise.all([getProduct(slug), getPurchaseInfo(slug)]);
  if (!product || !purchase) notFound();
  const [category, related] = await Promise.all([getCategory(product.categorySlug), getRelatedProducts(product.slug, 4)]);

  const initialColor = product.colors.find((c) => product.variants.some((v) => v.colorId === c.id && v.stock > 0)) ?? product.colors[0];
  const categoryHref = `/category/${product.categorySlug}`;

  return (
    <div className="container-page pt-5 md:pt-8">
      <Breadcrumbs
        items={[
          { href: "/shop", label: "فروشگاه" },
          ...(category ? [{ href: categoryHref, label: category.name }] : []),
          { label: product.name },
        ]}
      />

      <ProductSelectionProvider colorIds={product.colors.map((c) => c.id)} initialColorId={initialColor.id}>
        <div className="mt-5 grid gap-8 md:mt-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-12 xl:gap-20">
          <ProductGallery images={product.images} productName={product.name} />

          <div className="min-w-0">
            {category ? (
              <Link href={categoryHref} className="text-[0.8125rem] font-medium text-ink-muted hover:text-ink">
                {category.name}
              </Link>
            ) : null}
            <h1 className="mt-2 text-2xl font-extrabold leading-snug tracking-tight md:text-[2rem] md:leading-snug">{product.name}</h1>
            <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" className="mt-4" />
            <p className="mt-5 leading-8 text-ink-soft">{product.description}</p>

            <div className="mt-8">
              <ProductPurchase
                product={purchase}
                sizeGuide={
                  <div className="space-y-4">
                    <SizeGuideTable system={category?.sizeSystem ?? "alpha"} />
                    {product.fit ? <p className="text-sm leading-7 text-ink-soft">فرم این محصول: {product.fit}</p> : null}
                    <SizeGuideNote />
                    <Link href="/size-guide" className="inline-block text-sm text-rose-deep underline underline-offset-4">
                      راهنمای کامل اندازه‌گیری
                    </Link>
                  </div>
                }
              />
            </div>

            <div className="mt-10">
              <ProductDetails product={product} />
            </div>
          </div>
        </div>
      </ProductSelectionProvider>

      {related.length ? (
        <section aria-labelledby="related-title" className="pt-20 md:pt-28">
          <SectionHeading id="related-title" title="ممکن است بپسندید" link={category ? { href: categoryHref, label: `همه‌ی ${category.name}‌ها` } : undefined} />
          <ProductGrid products={related} columns="showcase" className="mt-8" />
        </section>
      ) : null}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          sku: product.id,
          image: product.images.filter((i) => i.kind === "front").map((i) => `${siteConfig.url}${i.src}`),
          brand: { "@type": "Brand", name: siteConfig.latinName },
          category: category?.name,
          material: product.material,
          color: product.colors.map((c) => c.name).join("، "),
          offers: {
            "@type": "Offer",
            url: `${siteConfig.url}/product/${product.slug}`,
            // Schema.org expects ISO 4217; 1 Toman = 10 Iranian Rials.
            priceCurrency: "IRR",
            price: product.price * 10,
            itemCondition: "https://schema.org/NewCondition",
          },
        }}
      />
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="container-page pt-5 md:pt-8" aria-hidden>
      <div className="h-4 w-48 rounded-xs bg-sand-soft" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-12 xl:gap-20">
        <div className="aspect-[3/4] animate-pulse rounded-xs bg-sand-soft lg:ms-[5.5rem]" />
        <div className="space-y-4">
          <div className="h-4 w-20 rounded-xs bg-sand-soft" />
          <div className="h-9 w-3/4 rounded-xs bg-sand-soft" />
          <div className="h-7 w-40 rounded-xs bg-sand-soft" />
          <div className="h-24 w-full rounded-xs bg-sand-soft" />
          <div className="h-14 w-full rounded-sm bg-sand-soft" />
        </div>
      </div>
    </div>
  );
}
