import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types/catalog";

export function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <section aria-labelledby="categories-title" className="container-page pt-12 md:pt-20">
      <h2 id="categories-title" className="sr-only">
        دسته‌بندی‌ها
      </h2>
      <ul className="grid grid-cols-3 gap-3 sm:gap-5 lg:gap-8">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link href={`/category/${c.slug}`} className="group block rounded-xs" data-testid={`category-tile-${c.slug}`}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-xs bg-sand-soft">
                <Image
                  src={c.image.src}
                  alt=""
                  fill
                  sizes="(min-width: 1408px) 440px, 33vw"
                  quality={60}
                  className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-2 md:mt-4">
                <span className="text-base font-bold md:text-xl">{c.name}</span>
                <span dir="ltr" className="hidden text-[0.6875rem] tracking-[0.2em] text-ink-muted uppercase sm:inline">
                  {c.latinName}
                </span>
              </div>
              <p className="mt-1 hidden text-sm text-ink-soft md:block">{c.tagline}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
