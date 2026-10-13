"use client";

import { useSyncExternalStore } from "react";

/**
 * Minimal external store with optional localStorage persistence.
 *
 * - Server render and hydration always see `initial`, so markup never
 *   mismatches; persisted state is read lazily on the first client subscription.
 * - Other tabs stay in sync through the `storage` event.
 * - No provider is required, which keeps layouts as Server Components.
 */
export interface Store<T> {
  getState: () => T;
  setState: (updater: (state: T) => T) => void;
  subscribe: (listener: () => void) => () => void;
  getServerSnapshot: () => T;
}

interface Options<T> {
  /** localStorage key; omit for an in-memory store. */
  storageKey?: string;
  /** Validates persisted data; return null to discard it. */
  parse?: (value: unknown) => T | null;
}

export function createStore<T>(initial: T, options: Options<T> = {}): Store<T> {
  let state = initial;
  let loaded = !options.storageKey;
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((l) => l());

  const read = () => {
    if (!options.storageKey) return;
    try {
      const raw = window.localStorage.getItem(options.storageKey);
      const parsed = raw ? (options.parse ? options.parse(JSON.parse(raw)) : (JSON.parse(raw) as T)) : null;
      state = parsed ?? initial;
    } catch {
      state = initial;
    }
  };

  const ensureLoaded = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    read();
    window.addEventListener("storage", (event) => {
      if (event.key === options.storageKey) {
        read();
        emit();
      }
    });
  };

  return {
    getState: () => {
      ensureLoaded();
      return state;
    },
    setState: (updater) => {
      ensureLoaded();
      state = updater(state);
      if (options.storageKey) {
        try {
          window.localStorage.setItem(options.storageKey, JSON.stringify(state));
        } catch {
          // Storage can be full or disabled (private mode); keep in-memory state.
        }
      }
      emit();
    },
    subscribe: (listener) => {
      ensureLoaded();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getServerSnapshot: () => initial,
  };
}

export function useStore<T, S>(store: Store<T>, selector: (state: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getServerSnapshot()),
  );
}

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true afterwards. Used to avoid flashing empty persisted UI. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
