/**
 * Opt-in stock model photography preview.
 * Assets are checked into public/images/model-preview so production and local
 * preview never make server-side requests to third-party image hosts.
 *
 * IMPORTANT: These are sample photographs, NOT the real Kasra garments.
 */
import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";

export const MODEL_PREVIEW_ENABLED = process.env.NEXT_PUBLIC_MODEL_PREVIEW === "true";

const MODEL_PHOTO_IDS = {
  shomiz: [6311591, 14196290, 14196293, 20167646, 7626573, 21327486, 18470992, 20167615, 29090983, 15221644, 20049645, 14196290],
  manto: [7760024, 8343183, 26100314, 30343462, 4456710, 6727407, 27153709, 5438403, 9968422, 4456713, 35332620, 4456720],
  tshirt: [9558752, 9558779, 7665792, 27083812, 20669451, 8130985, 9558725, 6777803, 24802383, 25630869, 18279210, 22617998],
} as const;

export type ModelPhotoCategory = keyof typeof MODEL_PHOTO_IDS;
const ASSET_ROOT = join(process.cwd(), "public", "images", "model-preview");

/** Return a local URL if a verified JPEG is present; otherwise let the
 * caller fall back to an original image. Width/height remain in the signature
 * for compatibility with editorial components and are handled by next/image. */
export function modelPhotoUrl(photoId: number, _width = 1200, _height = 1600): string | null {
  if (!MODEL_PREVIEW_ENABLED) return null;
  const name = `${photoId}.jpg`;
  if (!existsSync(join(ASSET_ROOT, name))) return null;
  return `/images/model-preview/${name}`;
}

/** Prefer a unique category photo, try others from the same category
 * if it could not be downloaded. Never emit a broken URL. */
export function productModelPhoto(category: ModelPhotoCategory, ordinal: number): string | null {
  if (!MODEL_PREVIEW_ENABLED) return null;
  const photos = MODEL_PHOTO_IDS[category];
  for (let i = 0; i < photos.length; i++) {
    const src = modelPhotoUrl(photos[(ordinal + i) % photos.length]);
    if (src) return src;
  }
  return null;
}

export function categoryModelPhoto(category: ModelPhotoCategory): string | null {
  return productModelPhoto(category, 0);
}
