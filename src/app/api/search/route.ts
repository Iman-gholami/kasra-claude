import type { NextRequest } from "next/server";
import { getSearchSuggestions } from "@/lib/catalog";

/** Typeahead suggestions for the search overlay. Public and safe to cache briefly at the CDN. */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  const result = await getSearchSuggestions(q, 6);
  return Response.json(result, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" },
  });
}
