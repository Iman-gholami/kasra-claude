import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Notice } from "@/components/ui/notice";
import { robotsFor } from "@/lib/seo";

export const metadata: Metadata = {
  title: "پرسش‌های متداول",
  description: "پاسخ پرسش‌های رایج درباره‌ی خرید از بوتیک کسرا",
  alternates: { canonical: "/faq" },
  robots: robotsFor(true),
};

const groups = [
  {
    title: "خرید و سفارش",
    items: [
      {
        q: "برای خرید باید ثبت‌نام کنم؟",
        a: "خیر. در طراحی فعلی، ثبت سفارش بدون ساخت حساب کاربری امکان‌پذیر است. در این نسخه‌ی نمایشی، سفارش‌ها آزمایشی هستند و ثبت واقعی انجام نمی‌شود.",
      },
      {
        q: "چطور بفهمم یک سایز یا رنگ موجود است؟",
        a: "در صفحه‌ی هر محصول، سایزهای ناموجودِ رنگ انتخاب‌شده غیرفعال و خط‌خورده نمایش داده می‌شوند و فقط ترکیب‌های موجود قابل افزودن به سبد هستند.",
      },
      {
        q: "آیا می‌توانم سفارشم را پیگیری کنم؟",
        a: "پیگیری سفارش پس از اتصال سامانه‌ی سفارش‌ها فعال می‌شود. در حال حاضر سفارش‌های آزمایشی شما در بخش حساب کاربری همین مرورگر دیده می‌شوند.",
      },
    ],
  },
  {
    title: "سایز و جنس",
    items: [
      {
        q: "چطور سایز مناسب را انتخاب کنم؟",
        a: "در هر صفحه‌ی محصول، کنار گزینه‌های سایز، «راهنمای سایز» قرار دارد. توضیح فرم هر محصول (مثلاً اورسایز یا جذب) هم در بخش مشخصات آمده است.",
        link: { href: "/size-guide", label: "راهنمای کامل سایز" },
      },
      {
        q: "جنس پارچه‌ها را از کجا ببینم؟",
        a: "در صفحه‌ی هر محصول، بخش «جنس و مشخصات» ترکیب پارچه، فرم و ویژگی‌های اصلی را نشان می‌دهد و «راهنمای نگهداری» نحوه‌ی شست‌وشو را توضیح می‌دهد.",
      },
    ],
  },
  {
    title: "ارسال، پرداخت و مرجوعی",
    items: [
      {
        q: "هزینه و زمان ارسال چقدر است؟",
        a: "نرخ‌ها و زمان‌بندی ارسال هنوز نهایی نشده‌اند. اعدادی که در سبد خرید می‌بینید نمونه هستند.",
        link: { href: "/shipping-and-returns", label: "شرایط ارسال و مرجوعی (نمونه)" },
      },
      {
        q: "پرداخت چگونه انجام می‌شود؟",
        a: "درگاه پرداخت هنوز متصل نشده است. در این نسخه هیچ مبلغی دریافت نمی‌شود و هیچ اطلاعات بانکی درخواست نمی‌شود.",
      },
      {
        q: "آیا امکان مرجوع کردن کالا وجود دارد؟",
        a: "سیاست مرجوعی رسمی پس از راه‌اندازی اعلام می‌شود. متن فعلی صفحه‌ی ارسال و مرجوعی فقط یک پیش‌نویس نمونه است.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="container-page max-w-4xl pt-5 md:pt-8">
      <PageHeader title="پرسش‌های متداول" crumbs={[{ label: "پرسش‌های متداول" }]} />
      <div className="space-y-12">
        {groups.map((group) => (
          <section key={group.title} aria-labelledby={`faq-${group.title}`}>
            <h2 id={`faq-${group.title}`} className="mb-3 text-lg font-bold">
              {group.title}
            </h2>
            <div className="border-t border-line">
              {group.items.map((item) => (
                <details key={item.q} className="group border-b border-line">
                  <summary className="flex min-h-14 items-center justify-between gap-4 py-4 font-medium">
                    {item.q}
                    <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden />
                  </summary>
                  <div className="pb-5 leading-8 text-ink-soft">
                    <p>{item.a}</p>
                    {"link" in item && item.link ? (
                      <Link href={item.link.href} className="mt-2 inline-block text-rose-deep underline underline-offset-4">
                        {item.link.label}
                      </Link>
                    ) : null}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
        <Notice>پاسخ‌ها بر اساس وضعیت نسخه‌ی نمایشی نوشته شده‌اند و پس از نهایی شدن سیاست‌های فروشگاه به‌روزرسانی می‌شوند.</Notice>
      </div>
    </div>
  );
}
