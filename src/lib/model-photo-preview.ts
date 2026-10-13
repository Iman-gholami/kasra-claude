/**
 * Optional stock-model photography preview.
 * The images are from Pexels, not photos of the mock boutique products.
 */
export const MODEL_PREVIEW_ENABLED = process.env.NEXT_PUBLIC_MODEL_PREVIEW === "true";

const MODEL_PHOTO_IDS = {
  shomiz: [6311591, 14196290, 14196293, 20167646, 7626573, 21327486, 18470992, 20167615, 29090983, 15221644, 20049645, 14196290],
  manto: [7760024, 8343183, 26100314, 30343462, 4456710, 6727407, 27153709, 5438403, 9968422, 4456713, 35332620, 4456720],
  tshirt: [9558752, 9558779, 7665792, 27083812, 20669451, 8130985, 9558725, 6777803, 24802383, 25630869, 18279210, 22617998],
} as const;

export type ModelPhotoCategory = keyof typeof MODEL_PHOTO_IDS;

export function modelPhotoUrl(photoId: number, width = 1200, height = 1600): string {
  return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop`;
}

export function productModelPhoto(category: ModelPhotoCategory, ordinal: number): string | null {
  if (!MODEL_PREVIEW_ENABLED) return null;
  const photos = MODEL_PHOTO_IDS[category];
  return modelPhotoUrl(photos[ordinal % photos.length]);
}

export function categoryModelPhoto(category: ModelPhotoCategory): string | null {
  if (!MODEL_PREVIEW_ENABLED) return null;
  return modelPhotoUrl(MODEL_PHOTO_IDS[category][0]);
}
