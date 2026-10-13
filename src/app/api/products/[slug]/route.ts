import type { NextRequest } from "next/server";
import { getPurchaseInfo } from "@/lib/catalog";

/**
 * Variant and stock data for the quick-add sheet. Short CDN lifetime: stock
 * shown here is informational; a real checkout must re-validate on the server.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/products/[slug]">) {
  const { slug } = await ctx.params;
  const info = await getPurchaseInfo(slug);
  if (!info) return Response.json({ error: "not_found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  return Response.json(info, { headers: { "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=120" } });
}
