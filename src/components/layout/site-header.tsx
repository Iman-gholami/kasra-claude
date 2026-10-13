import Link from "next/link";
import { mainNavigation } from "@/lib/site";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { AccountLink, CartTrigger, SearchTrigger, WishlistLink } from "./header-actions";

export function SiteHeader() {
  return (
    <header className="header-scroll-shadow sticky top-0 z-40 border-b border-line/70 bg-canvas/92 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/85">
      <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-2 lg:h-[4.5rem] lg:grid-cols-[auto_1fr_auto] lg:gap-8">
        {/* Start (right in RTL): menu + search on mobile, logo on desktop */}
        <div className="flex items-center lg:hidden">
          <MobileMenu />
          <SearchTrigger />
        </div>
        <Logo className="justify-self-center lg:justify-self-start" />

        <nav aria-label="منوی اصلی" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative inline-flex h-11 items-center px-3 text-[0.9375rem] font-medium text-ink-soft transition-colors after:absolute after:inset-x-3 after:bottom-2 after:h-px after:origin-right after:scale-x-0 after:bg-ink after:transition-transform after:duration-200 hover:text-ink hover:after:scale-x-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* End (left in RTL): actions */}
        <div className="flex items-center justify-self-end gap-0.5">
          <div className="me-2 hidden w-56 lg:block xl:w-64">
            <SearchTrigger variant="field" />
          </div>
          <AccountLink className="hidden lg:inline-flex" />
          <WishlistLink />
          <CartTrigger />
        </div>
      </div>
    </header>
  );
}
