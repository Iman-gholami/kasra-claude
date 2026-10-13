import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Notice } from "@/components/ui/notice";
import { demoCommerce } from "@/lib/site";
import { formatToman } from "@/lib/persian";
import { robotsFor } from "@/lib/seo";

export const metadata: Metadata = {
  title: "ارسال و مرجوعی (پیش‌نویس)",
  description: "پیش‌نویس شرایط ارسال و مرجوعی بوتیک کسرا — نمونه و غیرقطعی",
  alternates: { canonical: "/shipping-and-returns" },
  robots: robotsFor(false),
};

export default function ShippingReturnsPage() {
  return (
    <div className="container-page max-w-3xl pt-5 md:pt-8">
      <PageHeader title="ارسال و مرجوعی" crumbs={[{ label: "ارسال و مرجوعی" }]} />
      <Notice title="پیش‌نویس موقت — قطعی نیست">
        این صفحه فقط ساختار پیشنهادی شرایط ارسال و مرجوعی را نشان می‌دهد. هیچ‌یک از اعداد و قواعد زیر تعهد فروشگاه نیست و پیش از
        راه‌اندازی، با سیاست‌های رسمی و تأییدشده جایگزین می‌شود.
      </Notice>
      <div className="prose-fa mt-6">
        <h2>روش‌های ارسال (نمونه)</h2>
        <ul>
          {demoCommerce.shippingMethods.map((m) => (
            <li key={m.id}>
              {m.label}: {formatToman(m.price)} (نرخ نمونه)
            </li>
          ))}
          <li>ارسال رایگان برای سفارش‌های بالای {formatToman(demoCommerce.freeShippingThreshold)} (قانون نمونه)</li>
        </ul>
        <h2>زمان پردازش و تحویل</h2>
        <p>زمان آماده‌سازی و تحویل سفارش‌ها پس از قرارداد با شرکت‌های حمل‌ونقل اعلام می‌شود. در این نسخه هیچ زمان تحویلی تضمین نمی‌شود.</p>
        <h2>شرایط مرجوعی (پیشنهادی)</h2>
        <p>ساختار پیشنهادی برای سیاست مرجوعی که باید توسط مالک کسب‌وکار بررسی و تأیید شود:</p>
        <ul>
          <li>مهلت درخواست مرجوعی از زمان تحویل (مدت دقیق: تعیین نشده)</li>
          <li>شرایط کالا: استفاده‌نشده، با برچسب و بسته‌بندی اصلی</li>
          <li>روش ثبت درخواست: از طریق حساب کاربری یا پشتیبانی (پس از راه‌اندازی)</li>
          <li>نحوه‌ی بازگشت وجه یا تعویض سایز: تعیین نشده</li>
        </ul>
        <h2>پرسش دارید؟</h2>
        <p>
          پس از راه‌اندازی، راه‌های ارتباطی رسمی در صفحه‌ی <Link href="/contact">تماس با ما</Link> منتشر می‌شود.
        </p>
      </div>
    </div>
  );
}
