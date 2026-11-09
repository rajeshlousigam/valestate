"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
/** Colour palette, independent of light/dark. "estara" (logo gold) is the default. */
export type Palette = "estara" | "classic";

export const PALETTES: { id: Palette; label: string; swatch: [string, string] }[] = [
  { id: "estara", label: "Estara Gold", swatch: ["#0d0b08", "#d4a531"] },
  { id: "classic", label: "Classic Emerald", swatch: ["#0d7a64", "#d9a441"] },
];

const THEME_KEY = "hp-theme";
const PALETTE_KEY = "hp-palette";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
  palette: Palette;
  setPalette: (p: Palette) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
  setTheme: () => {},
  palette: "estara",
  setPalette: () => {},
  mounted: false,
});

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function applyPalette(p: Palette) {
  if (p === "estara") document.documentElement.removeAttribute("data-palette");
  else document.documentElement.setAttribute("data-palette", p);
}

const isPalette = (v: string | null): v is Palette => v === "estara" || v === "classic";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [palette, setPaletteState] = useState<Palette>("estara");
  const [mounted, setMounted] = useState(false);

  // Sync React state with what noFlashScript already applied before paint.
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    const initial = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const storedPalette = localStorage.getItem(PALETTE_KEY);
    const initialPalette: Palette = isPalette(storedPalette) ? storedPalette : "estara";
    applyTheme(initial);
    applyPalette(initialPalette);
    setThemeState(initial);
    setPaletteState(initialPalette);
    setMounted(true);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t);
    localStorage.setItem(THEME_KEY, t);
    setThemeState(t);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const setPalette = useCallback((p: Palette) => {
    applyPalette(p);
    localStorage.setItem(PALETTE_KEY, p);
    setPaletteState(p);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme, palette, setPalette, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

/** Inline script injected before paint to avoid a theme/palette flash. */
export const noFlashScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('${THEME_KEY}');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){d.classList.add('dark');}var p=localStorage.getItem('${PALETTE_KEY}');if(p==='classic'){d.setAttribute('data-palette','classic');}}catch(e){}})();`;
