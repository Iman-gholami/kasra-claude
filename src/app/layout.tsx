import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/layout/toaster";
import { CartDrawerLoader } from "@/components/cart/cart-drawer-loader";
import { SearchDialogLoader } from "@/components/search/search-dialog-loader";
import { siteConfig } from "@/lib/site";
import "./globals.css";

/*
 * Vazirmatn (SIL OFL 1.1), self-hosted — no third-party font CDN. A single
 * variable-weight subset (Persian + Basic Latin + punctuation, 300–800,
 * ~52 KB) built by scripts/subset-font.py is preloaded; `swap` keeps text
 * visible and the size-adjusted fallback minimizes layout shift.
 */
const vazir = localFont({
  src: "./fonts/vazirmatn-kasra.woff2",
  variable: "--font-vazir",
  weight: "300 800",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "بوتیک کسرا | استایل هر روزت، به سبک خودت",
    template: "%s | بوتیک کسرا",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: "بوتیک کسرا",
    description: siteConfig.description,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "رگال لباس بوتیک کسرا با مانتو و شومیز در رنگ‌های خنثی" }],
  },
  robots: siteConfig.allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#FAF8F5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa-IR" dir="rtl" className={vazir.variable}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-[70] rounded-sm bg-ink px-4 py-3 text-sm text-white focus:not-sr-only focus:fixed focus:top-3 focus:right-3"
        >
          پرش به محتوای اصلی
        </a>
        <AnnouncementBar />
        <SiteHeader />
        <main id="main" className="flex-1 focus:outline-none" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <CartDrawerLoader />
        <SearchDialogLoader />
        <Toaster />
      </body>
    </html>
  );
}
