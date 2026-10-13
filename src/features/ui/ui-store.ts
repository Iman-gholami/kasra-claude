"use client";

import { createStore, useStore } from "@/lib/store/create-store";

export interface Toast {
  id: number;
  message: string;
  action?: { href: string; label: string };
  tone?: "default" | "error";
}

interface UiState {
  cartOpen: boolean;
  /** Stays true after the first open so the lazily loaded drawer stays mounted. */
  cartRequested: boolean;
  searchOpen: boolean;
  /** Stays true after the first open so the lazily loaded overlay keeps its state. */
  searchRequested: boolean;
  toasts: Toast[];
}

export const uiStore = createStore<UiState>({ cartOpen: false, cartRequested: false, searchOpen: false, searchRequested: false, toasts: [] });

let toastId = 0;
const TOAST_MS = 4500;

export const uiActions = {
  openCart: () => uiStore.setState((s) => ({ ...s, cartOpen: true, cartRequested: true, searchOpen: false })),
  closeCart: () => uiStore.setState((s) => ({ ...s, cartOpen: false })),
  openSearch: () => uiStore.setState((s) => ({ ...s, searchOpen: true, searchRequested: true, cartOpen: false })),
  closeSearch: () => uiStore.setState((s) => ({ ...s, searchOpen: false })),
  toast(message: string, options: Omit<Toast, "id" | "message"> = {}) {
    const id = ++toastId;
    uiStore.setState((s) => ({ ...s, toasts: [...s.toasts.slice(-2), { id, message, ...options }] }));
    window.setTimeout(() => uiActions.dismissToast(id), TOAST_MS);
  },
  dismissToast: (id: number) => uiStore.setState((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) })),
};

export function useUi<S>(selector: (s: UiState) => S): S {
  return useStore(uiStore, selector);
}
