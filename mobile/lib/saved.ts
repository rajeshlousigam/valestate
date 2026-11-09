/**
 * "Interested / saved" listings — mirrors web/lib/saved.ts but persists to
 * AsyncStorage and uses a module-level subscriber set instead of window events.
 */
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SavedItem = {
  slug: string;
  title: string;
  thumbnail?: string;
  subtitle: string;
  locality: string;
};

const KEY = "es_saved";
let cache: SavedItem[] = [];
let hydrated = false;
const listeners = new Set<(items: SavedItem[]) => void>();

async function hydrate() {
  if (hydrated) return;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = raw ? JSON.parse(raw) : [];
  } catch {
    cache = [];
  }
  hydrated = true;
  emit();
}

function emit() {
  for (const l of listeners) l(cache);
}

async function persist(items: SavedItem[]) {
  cache = items;
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
  emit();
}

export function useSaved() {
  const [items, setItems] = useState<SavedItem[]>(cache);

  useEffect(() => {
    const on = (next: SavedItem[]) => setItems(next);
    listeners.add(on);
    hydrate();
    setItems(cache);
    return () => {
      listeners.delete(on);
    };
  }, []);

  const isSaved = useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);

  const toggle = useCallback((item: SavedItem) => {
    const next = cache.some((i) => i.slug === item.slug)
      ? cache.filter((i) => i.slug !== item.slug)
      : [item, ...cache];
    persist(next);
  }, []);

  return { items, isSaved, toggle };
}
