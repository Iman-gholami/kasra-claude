/** Size vocabulary shared by catalog data, filters and the variant picker. */

export const SIZE_LABELS: Record<string, string> = {
  FS: "فری‌سایز",
};

export const ALPHA_SIZES = ["S", "M", "L", "XL"];
export const NUMERIC_SIZES = ["38", "40", "42", "44", "46"];

/** Canonical ordering used by size facets across categories. */
export const SIZE_ORDER = ["FS", "XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44", "46", "48"];

export function sizeLabel(size: string): string {
  return SIZE_LABELS[size] ?? size;
}
