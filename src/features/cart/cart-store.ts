"use client";

import { createStore, useStore } from "@/lib/store/create-store";
import { demoCommerce } from "@/lib/site";
import type { CartLine } from "./types";

interface CartState {
  version: 1;
  lines: CartLine[];
}

const EMPTY: CartState = { version: 1, lines: [] };

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const l = value as Record<string, unknown>;
  return (
    typeof l.sku === "string" &&
    typeof l.slug === "string" &&
    typeof l.name === "string" &&
    typeof l.unitPrice === "number" &&
    typeof l.quantity === "number" &&
    typeof l.maxQuantity === "number" &&
    l.quantity > 0
  );
}

export const cartStore = createStore<CartState>(EMPTY, {
  storageKey: "kasra:cart",
  parse: (value) => {
    const v = value as Partial<CartState> | null;
    if (!v || v.version !== 1 || !Array.isArray(v.lines)) return null;
    return { version: 1, lines: v.lines.filter(isCartLine) };
  },
});

export interface AddResult {
  quantity: number;
  /** True when the requested quantity was reduced to the available stock. */
  capped: boolean;
}

export const cartActions = {
  add(line: Omit<CartLine, "quantity">, quantity: number): AddResult {
    let result: AddResult = { quantity: 0, capped: false };
    cartStore.setState((state) => {
      const limit = Math.min(line.maxQuantity, demoCommerce.maxQuantityPerLine);
      const existing = state.lines.find((l) => l.sku === line.sku);
      const desired = (existing?.quantity ?? 0) + quantity;
      const next = Math.min(desired, limit);
      result = { quantity: next, capped: next < desired };
      if (next <= 0) return state;
      const updated: CartLine = { ...line, quantity: next };
      return {
        ...state,
        lines: existing ? state.lines.map((l) => (l.sku === line.sku ? updated : l)) : [updated, ...state.lines],
      };
    });
    return result;
  },
  setQuantity(sku: string, quantity: number) {
    cartStore.setState((state) => ({
      ...state,
      lines: state.lines.flatMap((l) => {
        if (l.sku !== sku) return [l];
        const q = Math.min(Math.max(Math.floor(quantity), 0), l.maxQuantity, demoCommerce.maxQuantityPerLine);
        return q > 0 ? [{ ...l, quantity: q }] : [];
      }),
    }));
  },
  remove(sku: string) {
    cartStore.setState((state) => ({ ...state, lines: state.lines.filter((l) => l.sku !== sku) }));
  },
  clear() {
    cartStore.setState(() => EMPTY);
  },
};

export function useCartLines(): CartLine[] {
  return useStore(cartStore, (s) => s.lines);
}

export function useCartCount(): number {
  return useStore(cartStore, (s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));
}
