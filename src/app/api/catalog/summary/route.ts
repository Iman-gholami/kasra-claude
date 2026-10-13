import type { NextRequest } from "next/server";
import { queryCatalog } from "@/lib/catalog";
import { parseCatalogSearchParams } from "@/lib/catalog/search-params";

/**
 * Result count and facets for a catalog query, without products. Used by the
 * mobile filter sheet to preview "show N products" before applying filters.
 */
export async function GET(request: NextRequest) {
  const query = parseCatalogSearchParams(Object.fromEntries(request.nextUrl.searchParams));
  const { total, facets } = await queryCatalog({ ...query, page: 1 });
  return Response.json({ total, facets }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
}
