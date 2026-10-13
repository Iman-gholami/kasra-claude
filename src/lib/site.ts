/**
 * Site-wide configuration. Values that depend on the deployment come from
 * environment variables (see .env.example); everything else is brand copy.
 */

export const siteConfig = {
  name: "بوتیک کسرا",
  shortName: "کسرا",
  latinName: "Kasra Boutique",
  description:
    "بوتیک کسرا؛ شومیز، مانتو و تیشرت زنانه با طراحی مینیمال و مدرن. استایل هر روزت، به سبک خودت. (نسخه‌ی نمایشی)",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  /** Search engines are blocked unless explicitly enabled for a production launch. */
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
  locale: "fa_IR",
  /** Solar Hijri year shown in the footer. Kept static to avoid per-request date work. */
  copyrightYear: "۱۴۰۵",
} as const;

export const mainNavigation = [
  { href: "/category/shomiz", label: "شومیز" },
  { href: "/category/manto", label: "مانتو" },
  { href: "/category/tshirt", label: "تیشرت" },
  { href: "/shop?sort=newest", label: "جدیدترین‌ها" },
  { href: "/shop?sale=1", label: "تخفیف‌دارها" },
] as const;

export const footerNavigation = [
  {
    title: "فروشگاه",
    links: [
      { href: "/shop", label: "همه‌ی محصولات" },
      { href: "/category/shomiz", label: "شومیز" },
      { href: "/category/manto", label: "مانتو" },
      { href: "/category/tshirt", label: "تیشرت" },
    ],
  },
  {
    title: "راهنمای خرید",
    links: [
      { href: "/size-guide", label: "راهنمای سایز" },
      { href: "/shipping-and-returns", label: "ارسال و مرجوعی" },
      { href: "/faq", label: "پرسش‌های متداول" },
    ],
  },
  {
    title: "کسرا",
    links: [
      { href: "/about", label: "درباره‌ی ما" },
      { href: "/contact", label: "تماس با ما" },
      { href: "/account", label: "حساب کاربری" },
    ],
  },
] as const;

/**
 * Demo commerce rules. These are placeholders until real shipping rates and
 * policies are provided by the business; every UI surface that uses them
 * labels the values as samples.
 */
export const demoCommerce = {
  freeShippingThreshold: 3_000_000,
  shippingMethods: [
    { id: "post", label: "پست پیشتاز", description: "زمان تحویل پس از راه‌اندازی اعلام می‌شود", price: 95_000 },
    { id: "courier", label: "پیک (فقط تهران)", description: "زمان تحویل پس از راه‌اندازی اعلام می‌شود", price: 140_000 },
  ],
  maxQuantityPerLine: 10,
} as const;

export type ShippingMethodId = (typeof demoCommerce.shippingMethods)[number]["id"];
