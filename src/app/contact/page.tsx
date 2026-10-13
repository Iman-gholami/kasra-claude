import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { ContactForm } from "@/components/layout/contact-form";
import { DemoBadge } from "@/components/ui/demo-badge";
import { Notice } from "@/components/ui/notice";
import { robotsFor } from "@/lib/seo";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های ارتباط با بوتیک کسرا",
  alternates: { canonical: "/contact" },
  robots: robotsFor(true),
};

export default function ContactPage() {
  return (
    <div className="container-page pt-5 md:pt-8">
      <PageHeader title="تماس با ما" crumbs={[{ label: "تماس با ما" }]} description="سؤالی درباره‌ی سایز، سفارش یا محصولات دارید؟ خوشحال می‌شویم کمک کنیم." />
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div className="space-y-6">
          <Notice title="اطلاعات تماس هنوز منتشر نشده است">
            شماره‌ی تلفن، نشانی، ساعات پاسخ‌گویی و شبکه‌های اجتماعی رسمی کسرا پس از راه‌اندازی فروشگاه در این بخش قرار می‌گیرد. برای
            جلوگیری از اطلاعات نادرست، در این نسخه هیچ اطلاعات تماس فرضی نمایش داده نمی‌شود.
          </Notice>
          <div className="rounded-sm bg-sand-soft p-5 text-sm leading-7 text-ink-soft">
            <p className="font-semibold text-ink">پیش از تماس</p>
            <p className="mt-1">
              پاسخ بسیاری از پرسش‌ها درباره‌ی انتخاب سایز، ارسال و مرجوعی در بخش{" "}
              <Link href="/faq" className="text-rose-deep underline underline-offset-4">
                پرسش‌های متداول
              </Link>{" "}
              آمده است.
            </p>
          </div>
        </div>
        <section aria-labelledby="contact-form-title" className="rounded-sm border border-line bg-surface p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 id="contact-form-title" className="text-lg font-bold">
              ارسال پیام
            </h2>
            <DemoBadge>فرم نمایشی</DemoBadge>
          </div>
          <ContactForm />
        </section>
      </div>
    </div>
  );
}
