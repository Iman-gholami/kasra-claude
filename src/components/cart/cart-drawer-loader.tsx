"use client";

import dynamic from "next/dynamic";
import { useUi } from "@/features/ui/ui-store";

// The cart drawer (line items, steppers, totals) is fetched on first open;
// the header cart button warms this chunk on hover/focus.
const CartDrawer = dynamic(() => import("./cart-drawer").then((m) => m.CartDrawer), { ssr: false });

export const preloadCartDrawer = () => void import("./cart-drawer");

export function CartDrawerLoader() {
  const requested = useUi((s) => s.cartRequested);
  return requested ? <CartDrawer /> : null;
}
