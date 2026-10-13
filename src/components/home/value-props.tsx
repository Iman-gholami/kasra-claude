import Link from "next/link";
import { Ruler, ScrollText, ShieldCheck, UserRoundCheck } from "lucide-react";

const items = [
  {
    icon: Ruler,
    title: "راهنمای سایز برای هر محصول",
    text: "جدول اندازه‌ها و توضیح فرم هر لباس کنار گزینه‌های خرید آمده است.",
    href: "/size-guide",
  },
  {
    icon: ScrollText,
    title: "جنس و مشخصات شفاف",
    text: "ترکیب پارچه، فرم و راهنمای نگهداری هر محصول را پیش از خرید ببینید.",
  },
  {
    icon: UserRoundCheck,
    title: "خرید بدون اجبار به ثبت‌نام",
    text: "برای ثبت سفارش لازم نیست حساب کاربری بسازید.",
  },
  {
    icon: ShieldCheck,
    title: "شرایط ارسال و مرجوعی روشن",
    text: "شرایط پیش از خرید در دسترس است (متن فعلی نمونه است).",
    href: "/shipping-and-returns",
  },
];

export function ValueProps() {
  return (
    <section aria-labelledby="values-title" className="container-page pt-20 md:pt-28">
      <h2 id="values-title" className="sr-only">
        چرا کسرا
      </h2>
      <ul className="grid gap-px overflow-hidden rounded-xs border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text, href }) => (
          <li key={title} className="bg-canvas p-6 lg:p-7">
            <Icon className="size-6 text-rose-deep" strokeWidth={1.5} aria-hidden />
            <h3 className="mt-4 text-[0.9375rem] font-bold">
              {href ? (
                <Link href={href} className="hover:underline hover:underline-offset-4">
                  {title}
                </Link>
              ) : (
                title
              )}
            </h3>
            <p className="mt-2 text-sm leading-7 text-ink-soft">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
