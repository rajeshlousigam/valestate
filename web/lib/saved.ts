"use client";

import { useCallback, useEffect, useState } from "react";

/** Client-side "interested / saved" list (localStorage) — no backend needed. */
export type SavedItem = { slug: string; title: string; thumbnail?: string; subtitle: string; locality: string };

const KEY = "es_saved";

function read(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(items: SavedItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("ve-saved-changed"));
}

export function useSaved() {
  const [items, setItems] = useState<SavedItem[]>([]);
  useEffect(() => {
    setItems(read());
    const on = () => setItems(read());
    window.addEventListener("ve-saved-changed", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("ve-saved-changed", on);
      window.removeEventListener("storage", on);
    };
  }, []);

  const isSaved = useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);
  const toggle = useCallback((item: SavedItem) => {
    const cur = read();
    const next = cur.some((i) => i.slug === item.slug)
      ? cur.filter((i) => i.slug !== item.slug)
      : [item, ...cur];
    write(next);
  }, []);

  return { items, isSaved, toggle };
}
