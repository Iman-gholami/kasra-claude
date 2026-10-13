import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SizeGuideNote, SizeGuideTable } from "@/components/products/size-guide-table";
import { robotsFor } from "@/lib/seo";

export const metadata: Metadata = {
  title: "راهنمای سایز",
  description: "جدول سایز شومیز، تیشرت و مانتوی زنانه‌ی بوتیک کسرا و روش اندازه‌گیری",
  alternates: { canonical: "/size-guide" },
  robots: robotsFor(true),
};

const steps = [
  { title: "دور سینه", text: "متر را از برجسته‌ترین قسمت سینه و زیر بغل، به‌صورت افقی دور بدن بگیرید." },
  { title: "دور کمر", text: "باریک‌ترین قسمت کمر را، معمولاً کمی بالاتر از ناف، بدون کشیدن متر اندازه بگیرید." },
  { title: "دور باسن", text: "برجسته‌ترین قسمت باسن را در حالی که پاها کنار هم هستند اندازه بگیرید." },
  { title: "سرشانه", text: "فاصله‌ی دو سر شانه را از پشت، از یک استخوان شانه تا دیگری اندازه بگیرید." },
  { title: "قد آستین", text: "از سر شانه تا مچ دست را در حالی که دست کمی خم است اندازه بگیرید." },
];

export default function SizeGuidePage() {
  return (
    <div className="container-page max-w-4xl pt-5 md:pt-8">
      <PageHeader
        title="راهنمای سایز"
        crumbs={[{ label: "راهنمای سایز" }]}
        description="برای انتخاب سایز مناسب، اندازه‌های بدنتان را با جدول‌های زیر مقایسه کنید. فرم هر محصول (جذب، راسته یا اورسایز) در صفحه‌ی همان محصول آمده است."
      />
      <div className="space-y-8">
        <SizeGuideTable system="alpha" />
        <p className="text-sm leading-7 text-ink-soft">
          تیشرت‌های فری‌سایز (مثل تیشرت اورسایز سولو) برای اندازه‌های S تا XL طراحی شده‌اند.
        </p>
        <SizeGuideTable system="numeric" />
        <SizeGuideNote />
      </div>
      <section aria-labelledby="measure-title" className="mt-14">
        <h2 id="measure-title" className="text-xl font-bold">
          روش اندازه‌گیری
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-sm border border-line bg-surface p-5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sand text-sm font-bold" aria-hidden>
                {(i + 1).toLocaleString("fa-IR")}
              </span>
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm leading-7 text-ink-soft">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
