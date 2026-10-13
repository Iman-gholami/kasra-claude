"use client";

import { createStore, useStore } from "@/lib/store/create-store";
import type { CartLine, CartTotals } from "@/features/cart/types";

/**
 * Demo orders created by the simulated checkout. Only non-sensitive fields
 * are kept (no phone number, address or postal code) and nothing leaves the
 * browser. A real implementation would create orders through the backend.
 */
export interface DemoOrder {
  id: string;
  createdAt: string;
  customerName: string;
  city: string;
  province: string;
  shippingMethod: string;
  lines: Pick<CartLine, "sku" | "slug" | "name" | "image" | "colorName" | "sizeLabel" | "unitPrice" | "quantity">[];
  totals: CartTotals;
}

interface OrdersState {
  version: 1;
  orders: DemoOrder[];
}

const EMPTY: OrdersState = { version: 1, orders: [] };

export const ordersStore = createStore<OrdersState>(EMPTY, {
  storageKey: "kasra:demo-orders",
  parse: (value) => {
    const v = value as Partial<OrdersState> | null;
    if (!v || v.version !== 1 || !Array.isArray(v.orders)) return null;
    return { version: 1, orders: v.orders.filter((o) => o && typeof o.id === "string").slice(0, 10) };
  },
});

export const orderActions = {
  add(order: DemoOrder) {
    ordersStore.setState((s) => ({ ...s, orders: [order, ...s.orders].slice(0, 10) }));
  },
  clear() {
    ordersStore.setState(() => EMPTY);
  },
};

export function useDemoOrders(): DemoOrder[] {
  return useStore(ordersStore, (s) => s.orders);
}
