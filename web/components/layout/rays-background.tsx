"use client";

import SideRays from "@/components/effects/side-rays";
import { useTheme } from "@/components/theme/theme-provider";

/**
 * Ambient SideRays backdrop (React Bits) behind the frosted-glass UI.
 * Kangla gold + Loktak emerald; tuned subtle for a professional look, and
 * theme-aware (a touch brighter in dark mode).
 */
export function RaysBackground() {
  const { theme, mounted } = useTheme();
  const dark = theme === "dark";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      {mounted && (
        <SideRays
          origin="top-right"
          rayColor1="#d7a53a"
          rayColor2="#0f7a63"
          speed={2}
          intensity={dark ? 1.9 : 1.25}
          spread={2.2}
          tilt={-6}
          saturation={dark ? 1.35 : 1.1}
          blend={0.7}
          falloff={1.7}
          opacity={dark ? 0.6 : 0.42}
        />
      )}
      {/* faint grid for depth */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:56px_56px]" />
      {/* readability vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_40%,hsl(var(--bg)/0.55))]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg to-transparent" />
    </div>
  );
}
