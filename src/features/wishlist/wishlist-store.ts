"use client";

import { createStore, useStore } from "@/lib/store/create-store";

interface WishlistState {
  version: 1;
  ids: string[];
}

const EMPTY: WishlistState = { version: 1, ids: [] };

export const wishlistStore = createStore<WishlistState>(EMPTY, {
  storageKey: "kasra:wishlist",
  parse: (value) => {
    const v = value as Partial<WishlistState> | null;
    if (!v || v.version !== 1 || !Array.isArray(v.ids)) return null;
    return { version: 1, ids: v.ids.filter((id): id is string => typeof id === "string").slice(0, 200) };
  },
});

export const wishlistActions = {
  /** Returns true when the product is now saved. */
  toggle(productId: string): boolean {
    let saved = false;
    wishlistStore.setState((state) => {
      saved = !state.ids.includes(productId);
      return { ...state, ids: saved ? [productId, ...state.ids] : state.ids.filter((id) => id !== productId) };
    });
    return saved;
  },
  remove(productId: string) {
    wishlistStore.setState((state) => ({ ...state, ids: state.ids.filter((id) => id !== productId) }));
  },
};

export function useWishlistIds(): string[] {
  return useStore(wishlistStore, (s) => s.ids);
}

export function useIsWishlisted(productId: string): boolean {
  return useStore(wishlistStore, (s) => s.ids.includes(productId));
}

export function useWishlistCount(): number {
  return useStore(wishlistStore, (s) => s.ids.length);
}
