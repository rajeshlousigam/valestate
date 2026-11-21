/**
 * Estara palette (parity with web/app/globals.css): logo gold on deep teal
 * #1C4955 — ivory surfaces in light mode, teal-charcoal in dark mode.
 * Light/dark follows the device. Tokens are HSL triplets: applied as CSS
 * variables at the root (NativeWind `vars`) for className styling, and exposed
 * as `c` for colour *props* (lucide icons, gradients, ActivityIndicator).
 */
import { createContext, useContext, useMemo } from "react";
import { useColorScheme, View } from "react-native";
import { vars } from "nativewind";

const TOKENS = ["bg", "surface", "fg", "muted", "subtle", "line", "field", "brand", "brand2", "brandSoft", "accent", "success", "warning"] as const;
type Token = (typeof TOKENS)[number];
type Triplets = Record<Token, string>;
export type Palette = Record<Token, string>;

const CSS_VAR: Record<Token, string> = {
  bg: "--bg",
  surface: "--surface",
  fg: "--fg",
  muted: "--muted",
  subtle: "--subtle",
  line: "--line",
  field: "--field",
  brand: "--brand",
  brand2: "--brand-2",
  brandSoft: "--brand-soft",
  accent: "--accent",
  success: "--success",
  warning: "--warning",
};

const SETS: { light: Triplets; dark: Triplets } = {
  light: {
    bg: "40 33% 97%",
    surface: "0 0% 100%",
    fg: "196 30% 11%",
    muted: "196 10% 36%",
    subtle: "196 8% 50%",
    line: "38 18% 85%",
    field: "196 12% 66%",
    brand: "40 74% 36%",
    brand2: "193 50% 22%",
    brandSoft: "43 60% 92%",
    accent: "44 80% 46%",
    success: "152 60% 36%",
    warning: "24 90% 48%",
  },
  dark: {
    bg: "196 38% 7%",
    surface: "195 32% 11%",
    fg: "40 30% 94%",
    muted: "195 12% 70%",
    subtle: "195 10% 52%",
    line: "195 22% 19%",
    field: "195 16% 34%",
    brand: "43 72% 52%",
    brand2: "193 45% 30%",
    brandSoft: "193 32% 15%",
    accent: "44 74% 66%",
    success: "152 50% 48%",
    warning: "30 90% 56%",
  },
};

function toColors(t: Triplets): Palette {
  const out = {} as Palette;
  for (const k of TOKENS) out[k] = `hsl(${t[k]})`;
  return out;
}

interface ThemeValue {
  isDark: boolean;
  scheme: "light" | "dark";
  c: Palette;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const triplets = SETS[scheme];
  const value = useMemo<ThemeValue>(
    () => ({ isDark: scheme === "dark", scheme, c: toColors(triplets) }),
    [scheme, triplets],
  );
  const cssVars = useMemo(() => {
    const v: Record<string, string> = {};
    for (const k of TOKENS) v[CSS_VAR[k]] = triplets[k];
    return vars(v);
  }, [triplets]);

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, cssVars]}>{children}</View>
    </ThemeContext.Provider>
  );
}

/** Theme outside the provider (e.g. the root splash) falls back to the device scheme. */
export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  if (ctx) return ctx;
  return {
    isDark: scheme === "dark",
    scheme,
    c: toColors(SETS[scheme]),
  };
}

/** The signature brand gradient (matches web .brand-gradient, ~115°). */
export function brandGradient(c: Palette): [string, string] {
  return [c.brand, c.brand2];
}
