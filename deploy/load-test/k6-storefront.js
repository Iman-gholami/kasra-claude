/**
 * k6 load test for the Kasra storefront (https://k6.io).
 *
 *   k6 run -e BASE_URL=https://staging.kasra.example -e PROFILE=normal  deploy/load-test/k6-storefront.js
 *   k6 run -e BASE_URL=https://staging.kasra.example -e PROFILE=campaign deploy/load-test/k6-storefront.js
 *
 * Run against staging or the origin directly (bypassing the CDN) to measure
 * server capacity; run through the CDN to validate cache-hit behaviour.
 * Each iteration mimics a short browsing session: home → category → filtered
 * listing → product → search suggestion → quick-add data.
 */
import http from "k6/http";
import { check, group, sleep } from "k6";

const BASE = __ENV.BASE_URL || "http://127.0.0.1:3001";

const PROFILES = {
  // ~10k visits/day with a 3× daytime peak ≈ 1 session/s.
  normal: [
    { duration: "2m", target: 10 },
    { duration: "8m", target: 10 },
    { duration: "1m", target: 0 },
  ],
  // Campaign: ~100k visits/day concentrated after an announcement (10× peak).
  campaign: [
    { duration: "2m", target: 50 },
    { duration: "5m", target: 150 },
    { duration: "3m", target: 300 },
    { duration: "5m", target: 300 },
    { duration: "2m", target: 0 },
  ],
  smoke: [{ duration: "30s", target: 2 }],
};

export const options = {
  scenarios: {
    browse: { executor: "ramping-vus", startVUs: 0, stages: PROFILES[__ENV.PROFILE || "smoke"], gracefulRampDown: "30s" },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    "http_req_duration{type:page}": ["p(95)<800"],
    "http_req_duration{type:api}": ["p(95)<300"],
  },
};

const CATEGORIES = ["shomiz", "manto", "tshirt"];
const PRODUCTS = ["manto-barani-paeez", "shomiz-satin-raha", "tshirt-basic-rouzaneh", "manto-linen-naroon", "tshirt-oversize-solo"];
const QUERIES = ["مانتو", "لینن", "تیشرت اورسایز", "ساتن"];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

export default function browseSession() {
  const page = { tags: { type: "page" } };
  const api = { tags: { type: "api" } };

  group("home", () => {
    check(http.get(`${BASE}/`, page), { "home 200": (r) => r.status === 200 });
  });
  sleep(1 + Math.random() * 2);

  group("category", () => {
    check(http.get(`${BASE}/category/${pick(CATEGORIES)}`, page), { "category 200": (r) => r.status === 200 });
  });
  sleep(1 + Math.random() * 2);

  group("filtered listing", () => {
    const res = http.get(`${BASE}/shop?size=M&sort=price-asc&stock=1`, page);
    check(res, { "listing 200": (r) => r.status === 200 });
  });
  sleep(1 + Math.random() * 3);

  group("product", () => {
    const slug = pick(PRODUCTS);
    check(http.get(`${BASE}/product/${slug}`, page), { "product 200": (r) => r.status === 200 });
    check(http.get(`${BASE}/api/products/${slug}`, api), { "purchase info 200": (r) => r.status === 200 });
  });
  sleep(1 + Math.random() * 2);

  group("search", () => {
    const q = encodeURIComponent(pick(QUERIES));
    check(http.get(`${BASE}/api/search?q=${q}`, api), { "search 200": (r) => r.status === 200 });
  });
  sleep(2 + Math.random() * 3);
}
