export interface CartLine {
  /** Variant SKU — one line per product/colour/size combination. */
  sku: string;
  productId: string;
  slug: string;
  name: string;
  image: { src: string; alt: string };
  colorId: string;
  colorName: string;
  colorHex: string;
  size: string;
  sizeLabel: string;
  /** Price snapshot in Toman at the time the item was added. */
  unitPrice: number;
  compareAtPrice?: number;
  quantity: number;
  /** Stock snapshot used to cap quantities in the demo (a backend would re-validate). */
  maxQuantity: number;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  /** Sum of pre-discount prices for discounted lines plus regular prices. */
  originalSubtotal: number;
  savings: number;
  shipping: number;
  freeShippingRemaining: number;
  total: number;
}
