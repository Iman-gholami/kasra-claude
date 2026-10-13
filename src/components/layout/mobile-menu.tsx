"use client";

import Link from "next/link";
import { ArrowLeft, Menu } from "lucide-react";
import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { mainNavigation } from "@/lib/site";
import { LogoMark } from "./logo";

const secondaryLinks = [
  { href: "/account", label: "حساب کاربری" },
  { href: "/wishlist", label: "علاقه‌مندی‌ها" },
  { href: "/size-guide", label: "راهنمای سایز" },
  { href: "/shipping-and-returns", label: "ارسال و مرجوعی" },
  { href: "/faq", label: "پرسش‌های متداول" },
  { href: "/contact", label: "تماس با ما" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-sand-soft lg:hidden"
        aria-label="منوی اصلی"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Menu className="size-6" strokeWidth={1.6} aria-hidden />
      </button>
      <Drawer
        open={open}
        onClose={close}
        side="right"
        title={
          <span className="flex items-center gap-2">
            <LogoMark className="h-6" /> منو
          </span>
        }
      >
        <nav aria-label="منوی اصلی موبایل" className="px-5 py-4">
          <ul className="divide-y divide-line">
            <li>
              <Link href="/shop" onClick={close} className="flex items-center justify-between py-4 text-lg font-bold">
                همه‌ی محصولات <ArrowLeft className="size-4 text-ink-muted" aria-hidden />
              </Link>
            </li>
            {mainNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={close} className="flex items-center justify-between py-4 text-lg font-medium">
                  {item.label} <ArrowLeft className="size-4 text-ink-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-1 rounded-md bg-sand-soft p-4">
            {secondaryLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={close} className="block py-2 text-sm text-ink-soft hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs leading-6 text-ink-muted">
            این وب‌سایت نسخه‌ی نمایشی بوتیک کسرا است؛ محصولات، قیمت‌ها و موجودی‌ها نمونه هستند.
          </p>
        </nav>
      </Drawer>
    </>
  );
}
