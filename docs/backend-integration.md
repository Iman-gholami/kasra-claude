# Backend integration plan

The frontend is complete for this phase but uses mock data and browser-only state. This document lists what a production backend must provide and how it plugs in without restructuring the UI.

## 1. Integration points in the frontend

| Concern | Today | Replace with | Where |
|---|---|---|---|
| Catalog (products, categories, variants, media) | `mockCatalogRepository` | API adapter implementing `CatalogRepository` | `src/lib/catalog/repository.ts`, `index.ts` |
| Search / typeahead | In-memory tokenized search | Backend search endpoint (PostgreSQL full-text with Persian normalization, or a search service) behind `repository.suggest` / `queryProducts({ q })` | same |
| Inventory | Static `variants[].stock` | Live stock per SKU; `getPurchaseInfo` reads it with a short cache | same |
| Cart | `localStorage` (`src/features/cart`) | Server cart keyed by session/user; client store becomes a cache of the server cart | `cart-store.ts`, new `/api/cart` routes |
| Checkout | Client validation → demo order in `localStorage` | Server Action / API: re-validate input, re-price lines, reserve stock, create order, start payment | `components/checkout/checkout-form.tsx`, `features/checkout/validation.ts` (reuse server-side) |
| Orders | `kasra:demo-orders` | Orders API + account pages behind authentication | `features/orders`, `/account` |
| Wishlist | ids in `localStorage` | Per-user list (merge the local list on login) | `features/wishlist` |
| Auth | Disabled demo form | Mobile number + OTP, HTTP-only secure session cookie | `/account`, new auth routes |
| Shipping | `demoCommerce.shippingMethods` | Rates API by province/city/weight | `src/lib/site.ts`, checkout |
| Content | Sample copy in pages | CMS or static content reviewed by the business | `src/app/(content pages)` |

### Writing the API adapter

```ts
// src/lib/catalog/api-repository.ts (sketch)
import "server-only";
import type { CatalogRepository } from "./repository";

export function createApiCatalogRepository(baseUrl: string, token?: string): CatalogRepository {
  const get = async <T>(path: string): Promise<T> => {
    const res = await fetch(`${baseUrl}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error(`Catalog API ${res.status} ${path}`);
    return res.json() as Promise<T>;
  };
  return {
    listCategories: () => get("/v1/categories"),
    getCategory: (slug) => get(`/v1/categories/${slug}`).catch(() => null),
    queryProducts: (q) => get(`/v1/products?${serializeCatalogQuery(q)}`),
    // …map remaining methods; keep responses shaped like src/types/catalog.ts
  };
}
```

Then in `src/lib/catalog/index.ts`:

```ts
const repository = process.env.CATALOG_SOURCE === "api"
  ? createApiCatalogRepository(process.env.CATALOG_API_URL!, process.env.CATALOG_API_TOKEN)
  : mockCatalogRepository;
```

The accessors already wrap every call in `"use cache"` with tags. Add a protected webhook route (e.g. `POST /api/revalidate`, HMAC-signed) that the backend calls after price, stock or content changes:

```ts
revalidateTag(`product:${slug}`, "max");   // product page + purchase info
revalidateTag("listings", "max");          // grids, search, related products
```

…and purge the same URLs at the CDN.

**Prices and stock at checkout must never come from caches.** The server re-reads authoritative prices and stock when creating the order, inside the order transaction.

## 2. Backend integrations required before production launch

1. **Catalog & media service**: product/category CRUD, variant SKUs, image upload to S3-compatible object storage, served through the CDN (`next.config.ts` → `images.remotePatterns` or a custom loader).
2. **Inventory**: per-SKU stock, reservations with expiry during checkout, decrement on payment confirmation, admin adjustments, audit log.
3. **Cart & pricing**: server-side cart, price rules, discount codes, shipping calculation, and totals computed only on the server.
4. **Orders**: order creation (idempotency keys), status lifecycle (pending payment → paid → packed → shipped → delivered / cancelled / returned), customer order history, admin views.
5. **Payments**: an Iranian payment service provider via the Shaparak redirect flow. Server-side verification of every callback, idempotent handling of duplicate callbacks, reconciliation job, and no card data ever touching our servers.
6. **Authentication**: mobile + OTP through an SMS provider, rate limits and lockouts against OTP abuse, HTTP-only `Secure`/`SameSite=Lax` session cookies, session revocation.
7. **Shipping**: carrier rates and tracking (Post / courier services), delivery estimates by province.
8. **Notifications**: SMS for OTP and order status; email optional.
9. **Admin**: product, inventory, order and discount management (separate app or protected area; not part of the storefront bundle).
10. **Legal & trust**: final terms, privacy policy, returns policy, real contact details; e-Namad and other required trust registrations before taking payments.
11. **Observability**: structured logs, error tracking, metrics, alerting.

## 3. Recommended backend shape

A **modular monolith**: one deployable API service (e.g. NestJS/Fastify on Node, Go, or Django) with clear internal modules (catalog, inventory, cart, orders, payments, auth, shipping, notifications). Avoid microservices until separate scaling or team boundaries require them.

- **API style:** versioned REST (`/v1/...`) with OpenAPI, so the frontend adapter can be generated or type-checked.
- **Server-to-server:** Next.js server code calls the API over the private Docker network (`http://api:4000`). Browser calls that need the API go through Next.js route handlers or `/api/v1` proxied by Nginx with CORS limited to the site origin.
- **Sessions:** cookies set by the API domain/path or by Next.js route handlers. Pages that read the session use Suspense-wrapped request-time sections, so catalog pages stay static.

## 4. PostgreSQL

- Primary relational store for catalog, inventory, carts, orders, payments, users.
- Core tables: `products`, `product_variants (sku unique, product_id, color, size, price, compare_at_price)`, `inventory (sku pk, on_hand, reserved, version)`, `orders`, `order_items`, `payments (provider, authority, status, verified_at, unique(provider, authority))`, `users`, `addresses`, `carts`, `cart_items`.
- **Indexes:** `products (category_id, created_at desc)`, `products (featured, created_at desc)`, `product_variants (product_id)`, partial index on in-stock variants, a GIN index on a normalized Persian `tsvector`/trigram column for search, `orders (user_id, created_at desc)`.
- **Pagination:** keyset pagination for admin and infinite lists; the storefront's numbered pages map to `LIMIT/OFFSET` on small, filtered result sets, or to keyset with page tokens if catalogs grow.
- **Transactions:** order creation runs `SELECT … FOR UPDATE` on inventory rows (or optimistic `version` checks) and inserts the order, items and reservations in one transaction; payment confirmation is idempotent.
- **Connections:** a pool in the API (e.g. 20 connections) behind PgBouncer in transaction mode if more API instances are added; `max_connections=100`.
- **Security:** no published port, a separate least-privilege DB user for the app, TLS if the database moves off-host, secrets from the server secret store.
- **Operations:** persistent named volume or dedicated disk, automated backups with WAL archiving, monthly restore drills (see deployment §12), and a migration tool (e.g. Prisma Migrate, Drizzle, Flyway) run as a one-off job before rolling the API.

## 5. Redis (only where it earns its place)

- Rate limiting (OTP requests, login attempts, checkout submissions).
- Short-lived caches (shipping quotes, search suggestions) and the shared Next.js cache handler when there are several app servers.
- Background job coordination (BullMQ or similar) for SMS, payment reconciliation and stock-reservation expiry.
- **Never** the only store for orders, payments or inventory. Run it private, password-protected, with `maxmemory` and an LRU policy.

## 6. Future Compose services

`deploy/future/docker-compose.full-stack.example.yml` sketches the single-server layout (plan only, not runnable): `web-1/web-2` + `api` + `postgres` + `redis`, with an internal `backend` network for the data tier, no published database or cache ports, persistent volumes, health checks and resource budgets that fit the 8 vCPU / 16 GB server alongside the OS, Nginx and monitoring.
