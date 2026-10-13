import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/types/catalog";
import { Price } from "@/components/ui/price";
import { formatNumber } from "@/lib/persian";
import { cn } from "@/lib/cn";
import { ColorDots } from "./color-dots";
import { QuickAddButton } from "./quick-add-button";
import { WishlistButton } from "./wishlist-button";

export const PRODUCT_GRID_SIZES = "(min-width: 1408px) 330px, (min-width: 1024px) 24vw, (min-width: 640px) 32vw, 50vw";

interface ProductCardProps {
  product: ProductSummary;
  /** Above-the-fold cards load eagerly; the first one is fetched with high priority. */
  priority?: "high" | "eager";
  sizes?: string;
  headingLevel?: "h2" | "h3";
  className?: string;
}

export function ProductCard({ product, priority, sizes = PRODUCT_GRID_SIZES, headingLevel: Heading = "h3", className }: ProductCardProps) {
  const href = `/product/${product.slug}`;
  return (
    <article className={cn("group relative flex flex-col", className)} data-testid="product-card" data-product-id={product.id}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-xs bg-sand-soft">
        {/* Duplicate link for the image is hidden from AT and tab order; the title link is the accessible one. */}
        <Link href={href} tabIndex={-1} aria-hidden className="absolute inset-0">
          <Image
            src={product.image.src}
            alt=""
            fill
            sizes={sizes}
            quality={60}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority === "high" ? "high" : undefined}
            className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.025]"
          />
          {product.hoverImage ? (
            <Image
              src={product.hoverImage.src}
              alt=""
              fill
              sizes={sizes}
              quality={60}
              className="hidden object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 [@media(hover:hover)_and_(min-width:1024px)]:block"
            />
          ) : null}
        </Link>

        <div className="pointer-events-none absolute top-2.5 right-2.5 flex flex-col items-start gap-1.5">
          {!product.inStock ? (
            <span className="rounded-xs bg-surface/90 px-2 py-1 text-[0.6875rem] font-semibold text-ink-soft">ناموجود</span>
          ) : product.discountPercent ? (
            <span className="rounded-xs bg-rose-deep px-2 py-1 text-[0.6875rem] font-semibold text-white">
              {formatNumber(product.discountPercent)}٪ تخفیف
            </span>
          ) : product.isNew ? (
            <span className="rounded-xs bg-surface/90 px-2 py-1 text-[0.6875rem] font-semibold text-ink">جدید</span>
          ) : null}
        </div>

        <WishlistButton productId={product.id} productName={product.name} className="absolute top-2 left-2" />
        {product.inStock ? (
          <QuickAddButton slug={product.slug} productName={product.name} className="absolute bottom-2 left-2" />
        ) : null}
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1.5 px-0.5">
        <Heading className="text-[0.875rem] font-medium leading-6 sm:text-[0.9375rem]">
          <Link href={href} className="line-clamp-2 rounded-xs hover:underline hover:underline-offset-4">
            {product.name}
          </Link>
        </Heading>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} showDiscount={false} />
        <ColorDots colors={product.colors} />
      </div>
    </article>
  );
}
