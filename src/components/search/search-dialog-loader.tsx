"use client";

import dynamic from "next/dynamic";
import { useUi } from "@/features/ui/ui-store";

// The search overlay is only downloaded the first time a visitor opens it.
const SearchDialog = dynamic(() => import("./search-dialog"), { ssr: false });

export function SearchDialogLoader() {
  const open = useUi((s) => s.searchOpen);
  const requested = useUi((s) => s.searchRequested);
  return open || requested ? <SearchDialog /> : null;
}
