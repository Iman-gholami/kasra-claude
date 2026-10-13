"use client";

import { createContext, use, useEffect, useState, type ReactNode } from "react";

interface Selection {
  colorId: string;
  setColorId: (id: string) => void;
}

const Context = createContext<Selection | null>(null);

/**
 * Shares the selected colour between the gallery and the purchase panel and
 * mirrors it into `?color=` so a specific colourway can be linked to.
 */
export function ProductSelectionProvider({
  colorIds,
  initialColorId,
  children,
}: {
  colorIds: string[];
  initialColorId: string;
  children: ReactNode;
}) {
  const [colorId, setColor] = useState(initialColorId);

  useEffect(() => {
    // Honour a colour linked from the cart or a shared URL. Read once after
    // hydration so the prerendered HTML can stay identical for every visitor.
    const requested = new URLSearchParams(window.location.search).get("color");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the URL after hydration
    if (requested && requested !== initialColorId && colorIds.includes(requested)) setColor(requested);
  }, [colorIds, initialColorId]);

  const setColorId = (id: string) => {
    setColor(id);
    const url = new URL(window.location.href);
    url.searchParams.set("color", id);
    window.history.replaceState(window.history.state, "", url);
  };

  return <Context value={{ colorId, setColorId }}>{children}</Context>;
}

export function useProductSelection(): Selection {
  const ctx = use(Context);
  if (!ctx) throw new Error("useProductSelection must be used inside ProductSelectionProvider");
  return ctx;
}
