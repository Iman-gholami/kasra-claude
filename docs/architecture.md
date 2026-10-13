# Architecture

This document records the decisions behind the Kasra Boutique frontend: how it renders, where data comes from, how client state works, and why. It is written for the engineers who will connect the real backend.

## 1. Implementation architecture

```
Browser ──► ParsPack CDN/WAF ──► Nginx (TLS, rate limits, image cache) ──► Next.js ×2 (Docker)
                                                                              │
                                                       src/lib/catalog (cached accessors, "use cache")
                                                                              │
                                                       CatalogRepository ── mock adapter (today)
                                                                         └─ API adapter (future backend)
```

**Rendering model.** Next.js 16 App Router with **Cache Components** and **Partial Prefetching** enabled (the framework defaults for new apps).

| Route | Output | Why |
|---|---|---|
| `/`, `/product/[slug]` (all 36), content pages, `/cart`, `/wishlist`, `/checkout`, `/account` | Static (prerendered), revalidated via the `catalog` cache profile | Same HTML for every visitor; CDN-cacheable (`s-maxage`) |
| `/shop`, `/category/[slug]`, `/search` | Partial prerender: static shell (header, breadcrumbs, headings, skeleton) + results streamed at request time | Results depend on URL search parameters |
| `/api/*` | Request-time route handlers | Search suggestions, quick-add variant data, wishlist cards, filter previews, health |

- **Server Components by default.** Client components are limited to interactive leaves: header actions, drawers, filter controls, variant picker, gallery, purchase panel, cart/checkout views, toasts.
- **Listing results are cached per normalized query.** Pages read `searchParams` (request data) and pass the parsed `CatalogQuery` to `CachedCatalogView`, a `"use cache"` component. Repeat visits to the same filter URL skip server rendering of the listing (measured +65 % throughput; see the performance report).
- **Heavy optional UI is code-split** and loaded on first use: the search overlay, the cart drawer (warmed on hover/focus of the cart button) and the quick-add sheet.

We tried serving parameter-free listing URLs from a static route and filtered URLs from a rewritten dynamic route. We dropped it: the client router reused the static page across search-parameter changes, which broke client-side filtering. Micro-caching parameter-free listing HTML at the CDN/Nginx is documented as an optional optimization in `docs/deployment.md`.

## 2. Data access

- `src/types/catalog.ts`: domain types (`Product`, `ProductSummary`, `CatalogQuery`, `CatalogResult`, facets, search suggestions, purchase info).
- `src/lib/catalog/repository.ts`: the `CatalogRepository` contract (list/get categories, `queryProducts`, product detail, summaries by id, purchase info, related, new arrivals, featured, typeahead `suggest`, slugs).
- `src/lib/catalog/mock-repository.ts`: the in-memory adapter. It behaves like a backend: tokenized Persian search with relevance scoring, disjunctive facet counts, availability that honours selected sizes and colours, sold-out items sorted last, pagination with clamped page sizes. It only ever returns one page of lightweight summaries.
- `src/lib/catalog/index.ts`: `server-only` accessors, each wrapped in `"use cache"` with `cacheLife("catalog")` (stale 60 s, revalidate 5 min, expire 1 day) and tags (`catalog`, `listings`, `product:<slug>`, `categories`, `search`) for precise on-demand invalidation.
- `src/lib/catalog/search-params.ts`: the single definition of the URL format (`q, category, size, color, min, max, stock, sale, sort, page`), shared by server parsing and client navigation, with canonical ordering for stable URLs and cache keys.
- `src/data/*`: the mock dataset. `catalog-source.ts` holds raw definitions (36 products, 18 colours, 3 categories, explicit stock overrides used by tests, garment shapes for the image generator); `catalog.ts` builds typed entities once per process. Adding a category means adding a `CATEGORY_DEFINITIONS` entry plus products. The category route, filters, sitemap and navigation work from data.

## 3. Client state

`src/lib/store/create-store.ts` is a ~70-line external store on `useSyncExternalStore`:

- the server and hydration render the initial (empty) state, so markup never mismatches;
- persisted state is read lazily on the first client subscription and synced across tabs through the `storage` event;
- no React context providers, so layouts stay Server Components.

Stores: cart (`kasra:cart`, variant-level lines with price/stock snapshots), wishlist (`kasra:wishlist`, ids only; cards are fetched fresh), demo orders (`kasra:demo-orders`, no phone, address or postal code stored), UI (drawers, toasts; in memory). Count badges and persisted views render after hydration, with skeletons instead of a misleading "empty" flash.

## 4. Visual direction

"Quiet editorial": warm off-white canvas `#FAF8F5`, ink `#222`, soft beige `#E8DFD4` panels, muted rose `#B8847C` used sparingly (sale states, the arch monogram, progress), white surfaces. Derived tones are contrast-checked (see `src/app/globals.css`); for example, `rose-deep #8A574F` is used for small accent text (5.6:1). Typography is Vazirmatn with a strong weight contrast (extra-bold headlines, regular body, generous line height for Persian). Corners are restrained (2–10 px), with hairline borders, soft shadows only on floating UI, and 3:4 product imagery on sand backgrounds. The recurring **arch** motif (logo, category tiles) gives the brand a recognisable signature without decoration that slows pages down. Motion is CSS-only (drawers via `@starting-style`, hover zoom on cards, a header shadow driven by a scroll timeline) and disabled under `prefers-reduced-motion`.

## 5. Critical user journeys

1. Home → category tile or "مشاهده محصولات" → listing.
2. Listing → filter (size/colour/price/availability/discount) and sort → product.
3. Product → colour → size (sold-out sizes disabled) → add to cart (inline confirmation + toast; sticky bar on phones).
4. Cart (drawer or page) → quantities, totals → checkout → validated form → demo confirmation → order visible under the account page.
5. Search overlay → typeahead suggestion → product, or Enter → results page.
6. Wishlist from any card or product page → `/wishlist`.

Each journey is covered by a Playwright test (`e2e/`).

## 6. Performance strategy

- Static and partially prerendered HTML: TTFB of the shell is a few milliseconds and dynamic sections stream (Nginx buffering is disabled for pages).
- Small client surface: layout-level client code is limited to header actions, the mobile menu, toasts and loaders. Search, cart drawer and quick add are lazy chunks.
- Images: `next/image` with AVIF/WebP, a trimmed `deviceSizes`/`imageSizes` set, explicit `sizes` per context, `fetchPriority="high"` only on the LCP image (hero or first gallery image), lazy loading elsewhere, fixed aspect ratios, so CLS is 0. The hero uses `<picture>` art direction (portrait crop for phones, wide crop for tablets and desktop).
- Fonts: one preloaded 52 KB variable subset with `font-display: swap` and a size-adjusted fallback.
- Partial Prefetching: default `<Link>` prefetches only each route's App Shell, so large product grids don't trigger dozens of full prefetches.
- Caching: `"use cache"` data and listing renders; CDN-friendly `Cache-Control` from Next.js; immutable hashed assets; Nginx disk cache for optimized images.

## 7. RTL and Persian localization

`<html lang="fa-IR" dir="rtl">`. Layout uses logical properties (`ms-*`, `pe-*`, `start/end`), and directional icons are chosen for RTL ("next" is a left chevron or arrow). Drawers open from the reading-direction edges: menu from the right, cart from the left. Prices use `Intl.NumberFormat("fa-IR")` (Persian digits and the `٬` separator) with «تومان». Latin text (size codes, mobile numbers, order ids, emails) is isolated with `dir="ltr"`. Search normalizes Arabic/Persian letter variants, diacritics, ZWNJ and digits.

## 8. Accessibility

Semantic landmarks with a skip link, one `h1` per page, labelled navigation regions, native `<dialog>` for every drawer (focus trapping, Escape and focus restoration from the browser), native radio groups for colours and sizes (arrow-key navigation; sold-out sizes `disabled`), visible focus rings, an error summary that receives focus in checkout, field-level `aria-invalid`/`aria-describedby`, `role="status"` toasts announced politely, and `aria-busy` while listings update. axe scans (WCAG 2.0/2.1/2.2 A and AA tags) of nine pages report no serious or critical violations.

## 9. SEO

Per-page titles and descriptions, canonical URLs (filtered, sorted, paginated and search URLs are `noindex,follow` with canonicals to the clean listing), sitemap of categories, products and content pages, and Product JSON-LD (no ratings, reviews or availability claims; price expressed in IRR as schema.org requires ISO 4217). While `NEXT_PUBLIC_ALLOW_INDEXING` is not `true`, every page is `noindex,nofollow` and `robots.txt` disallows everything, which keeps the demo out of search engines.
