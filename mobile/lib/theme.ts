import { useColorScheme } from "react-native";

// Imperative palette for places that take a color *prop* rather than a
// className: lucide icon `color`, expo-linear-gradient `colors`, BlurView tint,
// StatusBar. Values mirror global.css / tailwind.config.js 1:1 — keep in sync.
export type Palette = {
  bg: string;
  surface: string;
  fg: string;
  muted: string;
  subtle: string;
  line: string;
  field: string;
  brand: string;
  brand2: string;
  brandSoft: string;
  accent: string;
  success: string;
  warning: string;
};

export const LIGHT: Palette = {
  bg: "hsl(196 28% 97%)",
  surface: "hsl(0 0% 100%)",
  fg: "hsl(200 30% 13%)",
  muted: "hsl(200 14% 36%)",
  subtle: "hsl(200 12% 52%)",
  line: "hsl(200 18% 84%)",
  field: "hsl(200 20% 68%)",
  brand: "hsl(170 78% 30%)",
  brand2: "hsl(190 82% 36%)",
  brandSoft: "hsl(174 44% 91%)",
  accent: "hsl(40 84% 45%)",
  success: "hsl(152 60% 40%)",
  warning: "hsl(32 90% 50%)",
};

export const DARK: Palette = {
  bg: "hsl(197 32% 7%)",
  surface: "hsl(198 24% 11%)",
  fg: "hsl(195 22% 96%)",
  muted: "hsl(196 13% 68%)",
  subtle: "hsl(196 11% 52%)",
  line: "hsl(198 20% 22%)",
  field: "hsl(196 15% 40%)",
  brand: "hsl(166 72% 47%)",
  brand2: "hsl(188 78% 52%)",
  brandSoft: "hsl(190 40% 15%)",
  accent: "hsl(42 88% 60%)",
  success: "hsl(152 58% 50%)",
  warning: "hsl(38 92% 58%)",
};

export function useTheme() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  return { isDark, scheme, c: isDark ? DARK : LIGHT };
}

/** The signature brand gradient (matches web .brand-gradient, ~115°). */
export function brandGradient(c: Palette): [string, string] {
  return [c.brand, c.brand2];
}
