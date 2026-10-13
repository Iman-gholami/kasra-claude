import Link from "next/link";
import { footerNavigation, siteConfig } from "@/lib/site";
import { LogoMark } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-sand-soft">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-8">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <p className="text-xl font-extrabold">بوتیک کسرا</p>
          </div>
          <p className="mt-4 text-sm leading-7 text-ink-soft">
            پوشاک زنانه با طراحی مینیمال برای استایل روزمره؛ شومیز، مانتو و تیشرت در رنگ‌های آرام و برش‌های راحت.
          </p>
          <p className="mt-4 rounded-sm border border-dashed border-line-strong px-3 py-2 text-xs leading-6 text-ink-soft">
            این وب‌سایت یک نمونه‌ی اولیه (پروتوتایپ) است. محصولات، قیمت‌ها، موجودی‌ها و سیاست‌ها نمونه هستند و هیچ سفارش یا
            پرداخت واقعی ثبت نمی‌شود.
          </p>
        </div>
        {footerNavigation.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-sm font-bold">{group.title}</h2>
            <ul className="mt-4 space-y-1">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-block py-1.5 text-sm text-ink-soft transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {siteConfig.copyrightYear} بوتیک کسرا — نسخه‌ی نمایشی</p>
          <p dir="ltr" className="tracking-[0.2em]">
            KASRA BOUTIQUE
          </p>
        </div>
      </div>
    </footer>
  );
}
