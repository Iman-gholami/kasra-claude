import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "صفحه پیدا نشد", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-20 text-center md:py-28">
      <p className="text-7xl font-extrabold tracking-tight text-sand-deep md:text-8xl" aria-hidden>
        ۴۰۴
      </p>
      <h1 className="mt-6 text-2xl font-extrabold md:text-3xl">این صفحه پیدا نشد</h1>
      <p className="mt-3 max-w-md leading-8 text-ink-soft">
        ممکن است نشانی اشتباه وارد شده باشد یا محصول موردنظر دیگر در فروشگاه نباشد.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/shop">مشاهده‌ی محصولات</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          صفحه‌ی اصلی
        </ButtonLink>
      </div>
      <nav aria-label="دسته‌بندی‌ها" className="mt-10 flex gap-6 text-sm">
        <Link href="/category/shomiz" className="underline underline-offset-4">
          شومیز
        </Link>
        <Link href="/category/manto" className="underline underline-offset-4">
          مانتو
        </Link>
        <Link href="/category/tshirt" className="underline underline-offset-4">
          تیشرت
        </Link>
      </nav>
    </div>
  );
}
