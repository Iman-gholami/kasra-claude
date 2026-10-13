import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/layout/toaster";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchDialogLoader } from "@/components/search/search-dialog-loader";
import { siteConfig } from "@/lib/site";
import "./globals.css";

/*
 * Vazirmatn (SIL OFL 1.1), self-hosted as two variable-weight subsets so no
 * third-party font CDN is involved. The Arabic-script subset carries Persian
 * letters and digits; the Latin subset covers spaces, punctuation and brand text.
 */
const vazirFa = localFont({
  src: "./fonts/vazirmatn-arabic.woff2",
  variable: "--font-vazir-fa",
  weight: "100 900",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC",
    },
  ],
});

const vazirLatin = localFont({
  src: "./fonts/vazirmatn-latin.woff2",
  variable: "--font-vazir-latin",
  weight: "100 900",
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
    <html lang="fa-IR" dir="rtl" className={`${vazirFa.variable} ${vazirLatin.variable}`}>
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
        <CartDrawer />
        <SearchDialogLoader />
        <Toaster />
      </body>
    </html>
  );
}
