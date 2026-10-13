import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { robotsFor } from "@/lib/seo";

export const metadata: Metadata = {
  title: "درباره‌ی کسرا",
  description: "بوتیک کسرا؛ پوشاک زنانه‌ی مینیمال برای استایل روزمره.",
  alternates: { canonical: "/about" },
  robots: robotsFor(true),
};

export default function AboutPage() {
  return (
    <div className="container-page pt-5 md:pt-8">
      <PageHeader title="درباره‌ی کسرا" crumbs={[{ label: "درباره‌ی ما" }]} />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="prose-fa">
          <p className="text-lg leading-9 text-ink">
            کسرا برای روزهای واقعی طراحی می‌کند؛ روزهایی که بین دانشگاه، کار و قرارهای دوستانه می‌گذرند و لباس باید هم راحت باشد،
            هم شیک.
          </p>
          <p>
            تمرکز ما روی سه دسته‌ی اصلی است: شومیز، مانتو و تیشرت. قطعه‌هایی که به‌راحتی با هم ست می‌شوند، در رنگ‌های آرام و خنثی، با
            برش‌های تمیز و پارچه‌هایی که برای استفاده‌ی هرروزه انتخاب شده‌اند.
          </p>
          <h2>آنچه برای ما مهم است</h2>
          <ul>
            <li>سادگی در طراحی؛ جزئیات کم اما دقیق.</li>
            <li>اطلاعات شفاف درباره‌ی جنس، فرم و نگهداری هر محصول.</li>
            <li>راهنمای سایز در دسترس، تا انتخاب سایز با اطمینان بیشتری انجام شود.</li>
            <li>تجربه‌ی خرید سریع و ساده، به‌ویژه روی موبایل.</li>
          </ul>
          <Notice className="mt-8" title="متن نمونه">
            این صفحه با متن نمونه تهیه شده است. داستان برند، تیم و اطلاعات رسمی کسب‌وکار پس از تأیید مالک برند جایگزین می‌شود.
          </Notice>
          <div className="mt-8">
            <ButtonLink href="/shop">مشاهده‌ی محصولات</ButtonLink>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-xs bg-sand-soft">
          <Image src="/images/editorial/about.webp" alt="شومیز سفید، مانتوی سبز مریمی و تیشرت صورتی روی رگال لباس" fill sizes="(min-width: 1024px) 50vw, 100vw" quality={60} className="object-cover" />
        </div>
      </div>
    </div>
  );
}
