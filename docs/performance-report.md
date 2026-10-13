# Performance report

All numbers below are **lab measurements** taken in the development sandbox on 2026-10-13. **No real-user (field) data exists yet** because the site has not been deployed. Lab and field metrics are reported separately, and the targets for real-user p75 metrics remain unverified until RUM data is collected.

## 1. Test setup

| | |
|---|---|
| Build | `next build` (Next.js 16.4.0, Turbopack, Cache Components, Partial Prefetching), served by `next start` on localhost |
| Browser | Chromium 141 (Playwright build 1194), headless |
| Tool | Lighthouse 12.8.2 CLI |
| Mobile profile | Lighthouse default: Moto G Power emulation, simulated throttling (150 ms RTT, ~1.6 Mbps down, 4× CPU slowdown) |
| Desktop profile | `--preset=desktop` |
| Runs | 3 runs per page (median reported) for `/`, `/shop`, `/category/manto`, `/product/manto-barani-paeez`; 1 run for others |
| Machine | Shared 4-vCPU sandbox (not the ParsPack server) |
| Indexing | `NEXT_PUBLIC_ALLOW_INDEXING=false` (demo): pages are intentionally `noindex` |

Reproduce:

```bash
npm run build && npm run start &
npx lighthouse@12.8.2 http://localhost:3000/ --only-categories=performance,accessibility,best-practices,seo
npx lighthouse@12.8.2 http://localhost:3000/ --preset=desktop
```

## 2. Lighthouse results (final build)

| Page | Profile | Performance (runs) | LCP | FCP | TBT | CLS | Speed Index | JS (gzip) | Total weight | A11y | Best practices | SEO* |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | Mobile | **98** (97, 98, 99) | 2.26 s | 0.92 s | 120 ms | 0 | 0.92 s | 179 KB | 318 KB | 100 | 100 | 69 |
| `/shop` | Mobile | **93** (93, 95, 93) | 2.95 s | 0.92 s | 94 ms | 0 | 1.17 s | 194 KB | 343 KB | 100 | 100 | 66 |
| `/category/manto` | Mobile | **93** (94, 93, 92) | 3.08 s | 0.92 s | 118 ms | 0 | 1.26 s | 194 KB | 348 KB | 100 | 100 | 66 |
| `/product/manto-barani-paeez` | Mobile | **94** (91, 94, 98) | 3.03 s | 0.91 s | 78 ms | 0 | 1.29 s | 194 KB | 341 KB | 100 | 100 | 69 |
| `/search?q=لینن` | Mobile | **94** | 3.00 s | 0.91 s | 74 ms | 0 | 1.14 s | 195 KB | 322 KB | 100 | 100 | 66 |
| `/cart` | Mobile | **95** | 2.74 s | 0.76 s | 122 ms | 0.005 | 0.76 s | 189 KB | 286 KB | 100 | 100 | 66 |
| `/` | Desktop | **100** | 0.62 s | 0.26 s | 0 ms | 0 | 0.26 s | 183 KB | 331 KB | 100 | 100 | 69 |
| `/shop` | Desktop | **100** | 0.73 s | 0.26 s | 0 ms | 0 | 0.43 s | 198 KB | 360 KB | 100 | 100 | 69 |
| `/product/manto-barani-paeez` | Desktop | **100** | 0.64 s | 0.25 s | 0 ms | 0 | 0.25 s | 198 KB | 357 KB | 100 | 100 | 69 |

\* The only failing SEO audit is `is-crawlable`, caused by the intentional demo `noindex`. A separate build with `NEXT_PUBLIC_ALLOW_INDEXING=true` scored **SEO 100** on `/`, `/shop`, `/category/manto` and `/product/manto-barani-paeez`.

### Against the targets

| Target | Lab result | Status |
|---|---|---|
| Mobile Lighthouse Performance ≥ 90 (defined setup above) | 93–98 on every page tested | **Met (lab)** |
| LCP ≤ 2.5 s (p75, field) | Lab, slow 4G + 4× CPU: 2.26 s on home, 2.7–3.1 s elsewhere; unthrottled observed LCP ≈ 0.4 s | **Not verified**: no field data. Lab LCP above 2.5 s on listing/product pages |
| INP ≤ 200 ms (p75, field) | Lab proxy TBT 74–129 ms (mobile), 0 ms (desktop) | **Not verified**: needs field data |
| CLS ≤ 0.1 (p75, field) | 0 on all pages except `/cart` 0.005 | **Met (lab)** |
| No horizontal overflow on mobile | Checked programmatically on 16 pages × 7 widths (320–1440 px): none | **Met** |
| Minimal initial JS | 179–198 KB gzip, of which ~125 KB is the Next.js/React framework | See §4 |

### Main remaining bottleneck: simulated LCP on listing and product pages

Lighthouse's LCP breakdown shows the LCP image (first product image or hero) is requested immediately and downloads within ~250 ms simulated time. Most of the simulated LCP is **element render delay**, during which the main thread evaluates the framework chunks (React DOM + Next.js runtime: ~300 ms and ~240 ms of script evaluation under 4× slowdown) and parses the streamed HTML and RSC payload. A CPU profile of the server shows no application-level hotspot either. Ideas that were tried or remain open are listed in §5.

## 3. Server throughput (lab)

`autocannon`, 50 connections, 15 s, against **one** frontend container from the final Docker image (Debian slim, `--cpus=2`, 1.5 GB). The load generator ran **on the same shared 4-vCPU machine**, so these numbers understate a dedicated server. Treat them as relative, not as capacity guarantees.

| Endpoint | Rendering | Req/s (avg) | Latency p50 / p97.5 |
|---|---|---|---|
| `/` | Static (prerendered) | 434 | 106 ms / 191 ms |
| `/product/manto-barani-paeez` | Static (prerendered) | 430 | 108 ms / 175 ms |
| `/api/search?q=لینن` | Route handler + cached search | 449 | 107 ms / 171 ms |
| `/category/manto` | Static shell + request-time listing | 26 | 1.48 s / 6.2 s (saturated) |
| `/shop?size=M&sort=price-asc` | Static shell + request-time listing | 24 | 1.47 s / 6.5 s (saturated) |

At 20 connections, the same listing pages served 30–40 req/s with p50 ≈ 0.5 s on the host Node process.

**Interpretation.** Prerendered pages and APIs are cheap, and in production most of them are absorbed by the CDN. Listing pages render ~12 cards plus the filter UI per request and are CPU-bound at roughly **25–40 req/s per Node process** on this sandbox. On the 8-vCPU server, plan for one replica per 1–1.5 cores during campaigns (3–4 replicas). Optional CDN micro-caching of parameter-free listing URLs is described in `docs/deployment.md` §9. Validate with `deploy/load-test/k6-storefront.js` on the real server before a campaign.

## 4. Payload budget

| Resource | Size (transfer) | Notes |
|---|---|---|
| HTML (home / product, gzip) | ~20 / ~21 KB | Static HTML + inline RSC payload |
| HTML (listing, gzip) | ~30–32 KB | Includes 12 cards and the filter panel |
| CSS | ~12 KB | Tailwind v4, one stylesheet |
| Font | 52 KB | One Vazirmatn variable subset, preloaded |
| JavaScript | 179–198 KB | ~125 KB framework (React DOM, Next.js runtime); the rest is app code split per route. Search overlay, cart drawer and quick-add sheet load on demand |
| LCP image | ~9 KB (AVIF, 828 w hero) | `fetchPriority="high"`; product grid images ≈ 1–3 KB each (AVIF) |

## 5. Optimizations made in response to measurements

| Change | Measured effect |
|---|---|
| Cache the rendered listing per normalized query (`"use cache"` component fed by parsed `searchParams`) | Listing throughput **23 → 39 req/s** (+65 %) on host Node; HTML 314 → 262 KB uncompressed |
| Render the mobile filter panel only when the sheet is open | Removes a second copy of the filter UI from every listing response |
| Remove card hover images | Halves per-card image markup and avoids desktop over-fetching |
| Single 52 KB Vazirmatn subset (Persian + Latin punctuation, wght 300–800) instead of two preloaded subsets (79 KB) | Less critical-path font data; product page median Performance 91 → 95 in the run immediately after the change |
| Lazy cart drawer (warmed on hover/focus) | Less JavaScript in the shared layout chunk |
| Debian-slim (glibc) runtime instead of Alpine (musl) | **+24 %** throughput for both static (318 → 394 req/s) and listing pages (25–28 → 30–35 req/s) at equal CPU limits; image 368 → 456 MB uncompressed |
| Static listing metadata + `X-Robots-Tag` for filtered permutations | Fixed the missing `<meta name="description">` (metadata was streamed); SEO 54 → 66 (100 with indexing on) |
| Cart skeleton with the empty-state footprint | `/cart` CLS 0.038 → 0.005 |

Tried and **not** adopted:

- `experimental.inlineCss`: FCP got worse (0.92 → ~1.1 s mobile) and LCP was mixed; reverted.
- Separate static route for parameter-free listings plus rewrites for filtered URLs: the client router reused the static page across search-parameter changes, breaking client-side filtering. Reverted, and the CDN micro-cache option documented instead.

## 6. Verification gaps

- **No field data.** LCP/INP/CLS p75 targets can only be confirmed after deployment. Plan: report `useReportWebVitals` metrics to a self-hosted endpoint (no third-party analytics) and review the p75 weekly.
- **Not measured on the ParsPack server or through ParsPack CDN.** Throughput above comes from a shared sandbox; run the k6 profiles on the real origin and through the CDN.
- **k6 was not executed** (not installed in the sandbox); `autocannon` was used for the lab throughput numbers. The k6 script was linted but not run.
- **Browsers:** automated tests and Lighthouse ran on Chromium only. Safari (iOS) and Firefox were not tested in this environment, so manual checks on real iPhones/Android devices are recommended, especially for `<dialog>` drawers, `@starting-style` transitions and `dvh` units, all of which need recent browser versions.
- **Real photography** will change image weights; re-run Lighthouse once real assets are in place.
