"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ProductImage } from "@/types/catalog";
import { formatNumber } from "@/lib/persian";
import { cn } from "@/lib/cn";
import { useProductSelection } from "./product-selection";

const MAIN_SIZES = "(min-width: 1408px) 760px, (min-width: 1024px) 55vw, 100vw";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const { colorId } = useProductSelection();
  const forColor = images.filter((i) => i.colorId === colorId);
  const list = forColor.length ? forColor : images.filter((i) => i.colorId === images[0]?.colorId);
  // Remount per colour so scroll position and zoom state reset cleanly.
  return <GalleryTrack key={colorId} images={list} productName={productName} isInitial={colorId === images[0]?.colorId} />;
}

function GalleryTrack({ images, productName, isInitial }: { images: ProductImage[]; productName: string; isInitial: boolean }) {
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const slides = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setIndex(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { threshold: 0.6 },
    );
    slides.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [images]);

  const goTo = (i: number) => {
    const target = (i + images.length) % images.length;
    slides.current[target]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setIndex(target);
  };

  return (
    <div className="lg:sticky lg:top-24 lg:grid lg:grid-cols-[4.5rem_1fr] lg:gap-4" aria-roledescription="گالری تصاویر" aria-label={`تصاویر ${productName}`}>
      {/* Thumbnails: a column beside the image on desktop, a row below it on phones */}
      <ul className="order-2 mt-3 flex gap-2 lg:order-none lg:mt-0 lg:flex-col" aria-label="انتخاب تصویر">
        {images.map((img, i) => (
          <li key={img.src}>
            <button
              type="button"
              onClick={() => goTo(i)}
              aria-label={`نمایش تصویر ${formatNumber(i + 1)} از ${formatNumber(images.length)}`}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "relative block aspect-[3/4] w-16 overflow-hidden rounded-xs bg-sand-soft transition-[opacity,box-shadow] lg:w-full",
                i === index ? "ring-2 ring-ink ring-offset-2 ring-offset-canvas" : "opacity-70 hover:opacity-100",
              )}
            >
              <Image src={img.src} alt="" fill sizes="72px" quality={60} className="object-cover" />
            </button>
          </li>
        ))}
      </ul>

      <div className="relative">
        <ul className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-xs bg-sand-soft" data-testid="gallery-track">
          {images.map((img, i) => (
            <li
              key={img.src}
              ref={(el) => {
                slides.current[i] = el;
              }}
              data-index={i}
              className="relative aspect-[3/4] w-full shrink-0 snap-start"
              aria-roledescription="اسلاید"
              aria-label={`${formatNumber(i + 1)} از ${formatNumber(images.length)}`}
            >
              <button
                type="button"
                onClick={() => {
                  setIndex(i);
                  setZoomOpen(true);
                }}
                className="group absolute inset-0 cursor-zoom-in"
                aria-label={`بزرگ‌نمایی تصویر: ${img.alt}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes={MAIN_SIZES}
                  quality={75}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 && isInitial ? "high" : undefined}
                  className="object-cover"
                />
                <span className="absolute bottom-3 left-3 inline-flex size-10 items-center justify-center rounded-full bg-surface/85 text-ink opacity-90 shadow-soft transition-opacity group-hover:opacity-100">
                  <Expand className="size-4" aria-hidden />
                </span>
              </button>
            </li>
          ))}
        </ul>
        {images.length > 1 ? (
          <>
            <div className="pointer-events-none absolute inset-x-3 top-1/2 hidden -translate-y-1/2 justify-between lg:flex">
              <button type="button" onClick={() => goTo(index - 1)} className="pointer-events-auto inline-flex size-11 items-center justify-center rounded-full bg-surface/85 shadow-soft hover:bg-surface" aria-label="تصویر قبلی">
                <ChevronRight className="size-5" aria-hidden />
              </button>
              <button type="button" onClick={() => goTo(index + 1)} className="pointer-events-auto inline-flex size-11 items-center justify-center rounded-full bg-surface/85 shadow-soft hover:bg-surface" aria-label="تصویر بعدی">
                <ChevronLeft className="size-5" aria-hidden />
              </button>
            </div>
            <p className="absolute top-3 right-3 rounded-full bg-surface/85 px-2.5 py-1 text-xs tabular-nums lg:hidden" aria-hidden>
              {formatNumber(index + 1)} / {formatNumber(images.length)}
            </p>
          </>
        ) : null}
      </div>

      {zoomOpen ? (
        <ZoomDialog images={images} index={index} onIndexChange={goTo} onClose={() => setZoomOpen(false)} />
      ) : null}
    </div>
  );
}

function ZoomDialog({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: ProductImage[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const image = images[index];

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label="نمای بزرگ تصویر"
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") onIndexChange(index + 1);
        if (e.key === "ArrowRight") onIndexChange(index - 1);
      }}
      className="fixed inset-0 z-50 m-0 h-dvh w-screen bg-canvas"
    >
      <div className={cn("h-full w-full", zoomed ? "overflow-auto" : "flex items-center justify-center overflow-hidden")}>
        <button
          type="button"
          onClick={() => setZoomed((z) => !z)}
          className={cn("relative block", zoomed ? "w-[200vw] max-w-[2400px] cursor-zoom-out lg:w-[150vw]" : "aspect-[3/4] h-full max-h-dvh max-w-full cursor-zoom-in")}
          aria-label={zoomed ? "کوچک‌نمایی" : "بزرگ‌نمایی بیشتر"}
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={zoomed ? "200vw" : "(min-width: 1024px) 75vh, 100vw"}
            quality={75}
            className={cn(zoomed ? "h-auto w-full" : "h-full w-auto object-contain")}
          />
        </button>
      </div>
      <div className="fixed top-3 left-3 flex gap-2">
        <button type="button" onClick={() => setZoomed((z) => !z)} className="inline-flex size-11 items-center justify-center rounded-full bg-surface shadow-soft" aria-label={zoomed ? "کوچک‌نمایی" : "بزرگ‌نمایی"}>
          {zoomed ? <ZoomOut className="size-5" aria-hidden /> : <ZoomIn className="size-5" aria-hidden />}
        </button>
        <button type="button" onClick={onClose} className="inline-flex size-11 items-center justify-center rounded-full bg-ink text-white shadow-soft" aria-label="بستن نمای بزرگ" autoFocus>
          <X className="size-5" aria-hidden />
        </button>
      </div>
      {images.length > 1 ? (
        <div className="fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] flex items-center justify-center gap-3">
          <button type="button" onClick={() => onIndexChange(index - 1)} className="inline-flex size-11 items-center justify-center rounded-full bg-surface shadow-soft" aria-label="تصویر قبلی">
            <ChevronRight className="size-5" aria-hidden />
          </button>
          <span className="rounded-full bg-surface px-3 py-1.5 text-sm tabular-nums shadow-soft" aria-live="polite">
            {formatNumber(index + 1)} / {formatNumber(images.length)}
          </span>
          <button type="button" onClick={() => onIndexChange(index + 1)} className="inline-flex size-11 items-center justify-center rounded-full bg-surface shadow-soft" aria-label="تصویر بعدی">
            <ChevronLeft className="size-5" aria-hidden />
          </button>
        </div>
      ) : null}
    </dialog>
  );
}
