import Link from "next/link";
import { formatToman } from "@/lib/persian";
import { demoCommerce } from "@/lib/site";

export function AnnouncementBar() {
  return (
    <div className="bg-ink text-white">
      <p className="container-page flex min-h-9 items-center justify-center gap-2 py-1.5 text-center text-xs leading-5">
        <span className="rounded-xs bg-white/15 px-1.5 py-0.5 text-[0.6875rem] font-semibold">نسخه‌ی نمایشی</span>
        <span>
          پیام آزمایشی: ارسال رایگان برای سفارش‌های بالای {formatToman(demoCommerce.freeShippingThreshold)}
          <Link href="/shipping-and-returns" className="ms-1.5 underline underline-offset-4 hover:no-underline">
            جزئیات
          </Link>
        </span>
      </p>
    </div>
  );
}
