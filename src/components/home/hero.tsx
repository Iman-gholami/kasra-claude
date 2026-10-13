import Link from "next/link";
import { getImageProps } from "next/image";
import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { MODEL_PREVIEW_ENABLED, modelPhotoUrl, productModelPhoto } from "@/lib/model-photo-preview";

/**
 * Editorial hero with art direction: a wide composition on tablet/desktop
 * and a portrait crop on phones. The image is the LCP element, so it is
 * fetched eagerly with high priority; no carousel, no autoplay.
 */
export function Hero() {
  const heroPhoto = MODEL_PREVIEW_ENABLED ? (modelPhotoUrl(9968422) ?? productModelPhoto("manto", 8)) : null;
  const alt = heroPhoto
    ? "عکس مدل نمونه با استایل پاییزی؛ عکس محصول واقعی نیست"
    : "رگال لباس با مانتو، شومیز و تیشرت در رنگ‌های خنثی کنار گلدانی از شاخه‌های خشک";
  const desktopSrc = heroPhoto ?? "/images/hero/hero-desktop.webp";
  const mobileSrc = heroPhoto ?? "/images/hero/hero-mobile.webp";
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ alt, src: desktopSrc, width: 2400, height: 1200, sizes: "100vw", quality: 75 });
  const {
    props: { srcSet: mobileSrcSet, ...img },
  } = getImageProps({
    alt,
    src: mobileSrc,
    width: 1080,
    height: 1350,
    sizes: "100vw",
    quality: 75,
    loading: "eager",
    fetchPriority: "high",
  });

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-sand">
      <div className="relative aspect-[4/5] max-h-[calc(100svh-6.5rem)] min-h-[30rem] w-full md:aspect-[2/1] md:max-h-[44rem] md:min-h-0">
        <picture>
          <source media="(min-width: 768px)" srcSet={desktopSrcSet} sizes="100vw" />
          <img {...img} srcSet={mobileSrcSet} alt={alt} className="absolute inset-0 size-full object-cover object-top md:object-center" />
        </picture>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-canvas/80 via-canvas/35 to-transparent md:hidden" aria-hidden />

        <div className="container-page absolute inset-0 flex items-end pb-8 md:items-center md:pb-0">
          <div className="max-w-md md:ms-0 md:w-[44%] md:max-w-[34rem] lg:w-[40%]">
            <p className="mb-3 text-[0.8125rem] font-medium text-ink-soft md:mb-4">کالکشن پاییز ۱۴۰۵</p>
            <h1 id="hero-title" className="text-[2rem] font-extrabold leading-[1.3] tracking-tight text-ink sm:text-[2.5rem] lg:text-[3.25rem] lg:leading-[1.25]">
              استایل هر روزت،
              <br />
              به سبک خودت
            </h1>
            <p className="mt-3 max-w-sm text-[0.9375rem] leading-7 text-ink-soft md:mt-5 md:text-base md:leading-8">
              شومیز، مانتو و تیشرت با برش‌های راحت و رنگ‌های آرام؛ برای روزهایی که می‌خواهی ساده و شیک باشی.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 md:mt-8">
              <ButtonLink href="/shop" size="lg">
                مشاهده محصولات
              </ButtonLink>
              <Link href="/shop?sort=newest" className="group inline-flex h-11 items-center gap-1.5 text-[0.9375rem] font-medium">
                جدیدترین‌ها
                <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
