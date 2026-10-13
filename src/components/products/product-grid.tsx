import type { ProductSummary } from "@/types/catalog";
import { cn } from "@/lib/cn";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: ProductSummary[];
  /** Number of leading cards that are likely above the fold. */
  eagerCount?: number;
  columns?: "catalog" | "showcase";
  className?: string;
}

export function ProductGrid({ products, eagerCount = 0, columns = "catalog", className }: ProductGridProps) {
  return (
    <ul
      role="list"
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5",
        columns === "catalog" ? "sm:grid-cols-3 xl:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product, i) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            priority={i === 0 && eagerCount > 0 ? "high" : i < eagerCount ? "eager" : undefined}
            sizes={columns === "catalog" ? "(min-width: 1408px) 300px, (min-width: 1280px) 22vw, (min-width: 1024px) 26vw, (min-width: 640px) 32vw, 50vw" : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
