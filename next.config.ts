import type { NextConfig } from "next";

/**
 * Security headers applied to every response. A strict nonce-based CSP needs
 * request-time rendering for every page, so it is left to the reverse proxy
 * stage (see docs/deployment.md) once real third-party origins are known.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    // Catalog reads (products, listings, search). Short enough that price and
    // stock changes surface within minutes; a backend can also invalidate on
    // demand with revalidateTag("product:<slug>") / revalidateTag("listings").
    catalog: { stale: 60, revalidate: 300, expire: 86_400 },
  },
  // Self-contained server bundle for the Docker runtime image.
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
    // Tuned for a 2–4 column fashion grid plus full-width hero/gallery images.
    deviceSizes: [384, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [64, 96, 128, 192, 256],
    // Optimized variants are content-addressed by the source URL; product
    // assets are immutable per path, so a long TTL is safe.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    localPatterns: [{ pathname: "/images/**" }],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
