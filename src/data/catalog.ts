/**
 * Builds typed catalog entities from the raw mock definitions. Product objects
 * are created once per server process and shared by every page through the
 * mock repository — pages never construct or copy product data themselves.
 */
import type { Category, Product, ProductImage, ProductVariant } from "@/types/catalog";
import {
  ALPHA_SIZES,
  CATEGORY_DEFINITIONS,
  COLORS,
  NUMERIC_SIZES,
  PRODUCT_DEFINITIONS,
  type ProductDefinition,
} from "./catalog-source";

export const PRODUCT_IMAGE_SIZE = { width: 1200, height: 1600 } as const;

const VIEW_LABELS: Record<ProductImage["kind"], string> = {
  front: "نمای جلو",
  back: "نمای پشت",
  detail: "جزئیات پارچه",
};

function fnv1a(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Deterministic sample stock: ~1 in 9 variants is sold out, others hold 1–9 units. */
function sampleStock(sku: string): number {
  const h = fnv1a(sku);
  return h % 9 === 0 ? 0 : 1 + (h % 9);
}

function buildVariants(def: ProductDefinition, sizes: string[]): ProductVariant[] {
  const variants: ProductVariant[] = [];
  for (const colorKey of def.colors) {
    const color = COLORS[colorKey];
    const override = def.stock?.[colorKey];
    for (const size of sizes) {
      const sku = `${def.id}-${color.id}-${size}`.toUpperCase();
      let stock: number;
      if (typeof override === "number") stock = override;
      else if (override && size in override) stock = override[size];
      else stock = sampleStock(sku);
      variants.push({ sku, colorId: color.id, size, stock });
    }
  }
  return variants;
}

function buildImages(def: ProductDefinition): ProductImage[] {
  return def.colors.flatMap((colorKey) => {
    const color = COLORS[colorKey];
    return (["front", "back", "detail"] as const).map((kind) => ({
      src: `/images/products/${def.slug}/${color.id}-${kind}.webp`,
      alt: `${def.name}، رنگ ${color.name} — ${VIEW_LABELS[kind]}`,
      colorId: color.id,
      kind,
      ...PRODUCT_IMAGE_SIZE,
    }));
  });
}

function buildProduct(def: ProductDefinition): Product {
  const category = CATEGORY_DEFINITIONS.find((c) => c.slug === def.category);
  if (!category) throw new Error(`Unknown category "${def.category}" for ${def.slug}`);
  const sizes = def.sizes ?? (category.sizeSystem === "numeric" ? NUMERIC_SIZES : ALPHA_SIZES);
  if (def.compareAtPrice !== undefined && def.compareAtPrice <= def.price) {
    throw new Error(`compareAtPrice must exceed price for ${def.slug}`);
  }
  return {
    id: def.id,
    slug: def.slug,
    name: def.name,
    categorySlug: def.category,
    price: def.price,
    compareAtPrice: def.compareAtPrice,
    description: def.description,
    images: buildImages(def),
    colors: def.colors.map((key) => ({ ...COLORS[key] })),
    sizes,
    variants: buildVariants(def, sizes),
    material: def.material,
    attributes: def.attributes.map(([label, value]) => ({ label, value })),
    fit: def.fit,
    care: def.care,
    createdAt: def.createdAt,
    featured: Boolean(def.featured),
    tags: def.tags ?? [],
  };
}

export const CATEGORIES: Category[] = CATEGORY_DEFINITIONS.map((c) => ({
  slug: c.slug,
  name: c.name,
  latinName: c.latinName,
  tagline: c.tagline,
  description: c.description,
  sizeSystem: c.sizeSystem,
  searchTerms: c.searchTerms,
  order: c.order,
  image: {
    src: `/images/categories/${c.slug}.webp`,
    alt: `مجموعه‌ی ${c.name} بوتیک کسرا`,
    ...PRODUCT_IMAGE_SIZE,
  },
})).sort((a, b) => a.order - b.order);

export const PRODUCTS: Product[] = PRODUCT_DEFINITIONS.map(buildProduct);
