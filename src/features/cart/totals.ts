import { demoCommerce, type ShippingMethodId } from "@/lib/site";
import type { CartLine, CartTotals } from "./types";

/** Pure cart arithmetic shared by the drawer, cart page and checkout. */
export function computeCartTotals(lines: CartLine[], shippingMethod: ShippingMethodId = "post"): CartTotals {
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const originalSubtotal = lines.reduce((sum, l) => sum + (l.compareAtPrice ?? l.unitPrice) * l.quantity, 0);
  const method = demoCommerce.shippingMethods.find((m) => m.id === shippingMethod) ?? demoCommerce.shippingMethods[0];
  const freeShipping = subtotal >= demoCommerce.freeShippingThreshold;
  const shipping = itemCount === 0 || freeShipping ? 0 : method.price;
  return {
    itemCount,
    subtotal,
    originalSubtotal,
    savings: originalSubtotal - subtotal,
    shipping,
    freeShippingRemaining: Math.max(0, demoCommerce.freeShippingThreshold - subtotal),
    total: subtotal + shipping,
  };
}
