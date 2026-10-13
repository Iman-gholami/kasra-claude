import type { NextRequest } from "next/server";
import { getProductSummaries } from "@/lib/catalog";

const MAX_IDS = 60;

/** Product cards for client-held id lists (the wishlist). */
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^[\w-]{1,40}$/.test(id))
    .slice(0, MAX_IDS);
  const items = ids.length ? await getProductSummaries(ids) : [];
  return Response.json({ items }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
}
