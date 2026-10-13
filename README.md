# بوتیک کسرا — Kasra Boutique (frontend prototype)

A Persian, right-to-left fashion storefront for **Kasra Boutique** (women's شومیز، مانتو، تیشرت), built as a fast, production-quality **frontend prototype** with realistic mock data and fully working shopping interactions.

> **Demo scope.** Products, prices, stock levels, shipping rules and policies are sample data. There is no backend, authentication, payment or real order submission. Every demo-only surface (checkout, account login, newsletter, contact form, shipping rates) is labelled in the UI.

| | |
|---|---|
| Framework | Next.js 16.4 (App Router, Cache Components, Partial Prefetching, Turbopack) |
| UI | React 19.3 · TypeScript (strict) · Tailwind CSS 4 · lucide-react |
| Font | Vazirmatn (SIL OFL), one self-hosted 52 KB variable subset |
| Tests | Playwright (desktop + mobile projects) · axe-core accessibility scans |
| Runtime | Node.js ≥ 22.18 · Docker (standalone output) · Nginx |

---

## Quick start

```bash
npm ci                 # install exact dependencies
npm run dev            # http://localhost:3000 (development)

npm run build          # production build (standalone output)
npm run start          # serve the production build on :3000
```

> `next start` prints a notice because the build uses `output: "standalone"` for Docker; it still serves the app correctly for local checks. In containers the app runs `node server.js` from `.next/standalone`.

### Quality checks

```bash
npm run typecheck      # next typegen + tsc --noEmit
npm run lint           # ESLint (next/core-web-vitals + TypeScript rules)
npm run check          # typecheck + lint + production build
```

### End-to-end tests

```bash
npx playwright install chromium     # once (skip if a Chromium is already available)
npm run build
npm run test:e2e                    # starts `next start` on :3200 automatically
```

- `PLAYWRIGHT_BASE_URL=https://staging.example npm run test:e2e` tests an already running deployment.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome` uses a pre-installed Chromium.
- 32 scenarios × 2 projects (desktop 1440 px, mobile Pixel 7) cover browsing, search, filtering, sorting, pagination, variants, sold-out handling, quick add, cart totals and persistence, wishlist, demo checkout validation and confirmation, mobile navigation, the sticky purchase bar, and axe WCAG 2.x A/AA scans. Every test also fails on any browser console error.

### Docker

```bash
cp .env.example .env.production          # adjust NEXT_PUBLIC_SITE_URL etc.
docker compose build
docker compose up -d                     # two replicas on 127.0.0.1:3001 / :3002
docker compose ps                        # both should report (healthy)
curl -s localhost:3001/api/health
```

Production deployment on the ParsPack Ubuntu server (Nginx, TLS, CDN, monitoring, backups, rollback, load testing) is documented in **[docs/deployment.md](docs/deployment.md)**.

---

## What is included

**Pages:** `/` · `/shop` · `/category/[slug]` · `/product/[slug]` · `/search` · `/wishlist` · `/cart` · `/checkout` · `/checkout/confirmation` · `/account` · `/about` · `/contact` · `/faq` · `/shipping-and-returns` · `/size-guide` · custom 404 · error boundary.
**Route handlers:** `/api/health`, `/api/search`, `/api/products/[slug]`, `/api/products/summaries`, `/api/catalog/summary`.
**SEO:** metadata per page, canonical URLs, `robots.txt`, `sitemap.xml`, web manifest, Open Graph image, JSON-LD (WebSite + SearchAction, BreadcrumbList, Product without ratings/availability claims).

Highlights:

- **Catalog**: server-side search, filtering (category, size, colour, price range, availability, discount), sorting and link-based pagination, all reflected in shareable URL parameters. Disjunctive facet counts. Desktop filters apply instantly; the phone filter sheet previews "show N products" and applies once.
- **Product page**: colour-specific gallery with thumbnails, swipe and zoom; real variant logic (per colour/size stock, sold-out sizes disabled, sold-out products blocked); accessible errors; size-guide sheet; sticky mobile purchase bar; related products.
- **Search**: overlay with typeahead (combobox/listbox, keyboard navigation, Escape), debounced requests to a server endpoint, Persian normalization (ی/ي, ک/ك, ZWNJ, Persian/Arabic digits, «تی‌شرت» = «تیشرت»), results page and no-results state.
- **Cart & wishlist**: persisted in `localStorage`, synced across tabs, no hydration mismatch or empty-state flash, variant-level lines, stock-capped quantities, discount and sample-shipping totals, cart drawer and full cart page.
- **Demo checkout**: Iranian mobile and postal-code validation (Persian digits accepted), province list, sample shipping methods, error summary with focus management, explicit "no payment" notice, demo confirmation and order history on the account page.

---

## Project structure

```
src/
  app/                    routes, layouts, metadata routes, route handlers
  components/
    layout/               header, footer, menus, toaster, page header
    home/                 hero, category tiles, collection banner, value props, newsletter
    catalog/              catalog view, filters, sorting, active chips, pagination
    products/             product card/grid, gallery, variant picker, purchase panel, size guide
    cart/  checkout/  search/  wishlist/  account/
    ui/                   button, drawer (native <dialog>), price, field, breadcrumbs, …
    seo/                  JSON-LD helper
  features/               client stores and domain logic (cart, wishlist, orders, checkout, ui)
  lib/
    catalog/              repository interface, mock adapter, cached accessors, URL params
    store/                tiny external store with localStorage persistence
    persian.ts            digits, Toman formatting, search normalization
    site.ts  seo.ts  cn.ts
  data/                   mock catalog source, sizes, entity builders
  types/                  domain types
scripts/                  placeholder image generator, font subsetter
e2e/                      Playwright tests
deploy/                   nginx config, deploy/rollback scripts, k6 load test, future compose plan
docs/                     architecture, deployment, backend integration, performance report
```

More detail: **[docs/architecture.md](docs/architecture.md)**.

---

## Replacing the mock data

UI code never imports mock data directly. Everything goes through the `CatalogRepository` contract in `src/lib/catalog/repository.ts`, exposed as cached server functions in `src/lib/catalog/index.ts`:

1. Implement `CatalogRepository` against the real API (e.g. `src/lib/catalog/api-repository.ts`), mapping responses to the types in `src/types/catalog.ts`.
2. Switch the `repository` constant in `src/lib/catalog/index.ts` (optionally by `CATALOG_SOURCE` env var).
3. Keep the `cacheTag`s and call `revalidateTag("product:<slug>", "max")` / `revalidateTag("listings", "max")` from a webhook route when the backend changes products or stock.

Cart, wishlist and demo orders live in `src/features/*` stores; see **[docs/backend-integration.md](docs/backend-integration.md)** for moving them to server-backed APIs, plus the list of backend integrations required before launch.

## Images

Real product photography was not available, and stock-photo hosts are not reachable from the build environment. All imagery is **generated, art-directed placeholder illustration** (studio "ghost mannequin" renders per colourway: front, back and fabric detail; category tiles; hero; collection banners), produced by:

```bash
npm run images:generate                       # all images (~5 min, 4 cores)
npm run images:generate -- --only=manto-barani # selected products
npm run images:generate -- --scenes            # hero/category/editorial only
```

To use real photos, keep the same paths (`public/images/products/<slug>/<colorId>-{front,back,detail}.webp`, 3:4, ≥ 1200 × 1600), or point image URLs at a media CDN/object storage in the catalog adapter and add its host to `images.remotePatterns` (or a custom `images.loader`) in `next.config.ts`. Do not store thousands of full-resolution photos in the repository or the container image.

## Fonts

`src/app/fonts/vazirmatn-kasra.woff2` is a subset of Vazirmatn v33 (SIL Open Font License, see `src/app/fonts/OFL-LICENSE.txt`) built with `scripts/subset-font.py`. No third-party font CDN is used, which also matters for availability in Iran.

---

## Backend integrations required before production launch

1. **Catalog API**: products, categories, variants, media URLs, search (replace the mock adapter).
2. **Inventory**: authoritative per-variant stock with reservation at checkout.
3. **Orders**: server-side cart re-pricing, order creation, order history and status.
4. **Payment gateway**: an Iranian PSP via redirect flow (Shaparak-compliant), with server-side verification and idempotent callbacks.
5. **Authentication**: mobile number + OTP via an SMS provider, sessions, account pages.
6. **Shipping**: real rates, methods and delivery estimates from carriers (e.g. Post, couriers).
7. **Content & policies**: final copy, legal pages, returns policy, contact details, e-Namad/Samandehi trust badges once issued.
8. **Notifications & newsletter**: SMS/email provider integration.
9. **Observability**: error tracking, Web Vitals RUM (self-hosted), uptime alerts.

Details and the planned PostgreSQL/Redis architecture: [docs/backend-integration.md](docs/backend-integration.md). Measured performance: [docs/performance-report.md](docs/performance-report.md).
