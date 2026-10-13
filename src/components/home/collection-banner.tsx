import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";

export function CollectionBanner() {
  return (
    <section aria-labelledby="collection-title" className="container-page pt-20 md:pt-28">
      <div className="grid overflow-hidden rounded-xs bg-sand-soft md:grid-cols-2">
        <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[36rem]">
          <Image
            src="/images/editorial/autumn-collection.webp"
            alt="سه مانتوی پاییزی قهوه‌ای، بژ و ذغالی آویخته روی رگال"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            quality={60}
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-10 md:px-12 lg:px-20">
          <p className="eyebrow uppercase tracking-[0.2em]">
            <span dir="ltr">Autumn Edit</span>
          </p>
          <h2 id="collection-title" className="mt-3 text-[1.75rem] font-extrabold leading-snug tracking-tight lg:text-4xl lg:leading-snug">
            مانتوهای پاییزی؛
            <br />
            گرم، ساده، ماندگار
          </h2>
          <p className="mt-4 max-w-md leading-8 text-ink-soft">
            از بارانی کلاسیک دوردیف دکمه تا مانتوهای کتان بلند؛ رنگ‌های خاکی و برش‌های تمیز که سال‌ها همراهت می‌مانند.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/category/manto">مشاهده‌ی مانتوها</ButtonLink>
            <ButtonLink href="/shop?q=پاییزه" variant="secondary">
              منتخب پاییزه
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
