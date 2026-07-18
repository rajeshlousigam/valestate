"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * "Blinking Squares" background — property/building tiles that quietly twinkle,
 * scattered like markers on a map (jittered positions + faint map grid + roads).
 * License-free equivalent of the React Bits Pro component, tuned to ValEstate's
 * emerald + gold identity. Positions are seeded so SSR and client match.
 */

type Tile = {
  x: number;
  y: number;
  size: number;
  delay: number;
  dur: number;
  tmin: number;
  tmax: number;
  rot: number;
  verified: boolean;
};

// deterministic PRNG (mulberry32) → stable positions, no hydration mismatch
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generate(count: number): Tile[] {
  const rnd = mulberry32(20260718);
  const tiles: Tile[] = [];
  for (let i = 0; i < count; i++) {
    const verified = rnd() > 0.9;
    tiles.push({
      x: rnd() * 100,
      y: rnd() * 100,
      size: 8 + Math.round(rnd() * (verified ? 16 : 20)),
      delay: rnd() * 7,
      dur: 3.5 + rnd() * 5,
      tmin: 0.03 + rnd() * 0.05,
      tmax: (verified ? 0.28 : 0.14) + rnd() * 0.14,
      rot: rnd() * 10 - 5,
      verified,
    });
  }
  return tiles;
}

export function BlinkingSquares({ count = 90 }: { count?: number }) {
  const tiles = useMemo(() => generate(count), [count]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      {/* map grid */}
      <div className="absolute inset-0 text-fg opacity-[0.01] dark:opacity-[0.01] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:46px_46px]" />

      {/* faint 'roads' crossing the map */}
      <div className="absolute -left-1/4 top-1/3 h-px w-[150%] rotate-[8deg] bg-fg/[0.01]" />
      <div className="absolute -left-1/4 top-2/3 h-px w-[150%] -rotate-[5deg] bg-fg/[0.01]" />
      <div className="absolute left-1/3 top-[-25%] h-[150%] w-px rotate-[10deg] bg-fg/[0.01]" />
      <div className="absolute left-2/3 top-[-25%] h-[150%] w-px -rotate-[7deg] bg-fg/[0.01]" />

      {/* scattered twinkling property tiles (dimmed in light for readability) */}
      <div className="absolute inset-0 opacity-50 dark:opacity-100">
        {tiles.map((t, i) => (
          <span
            key={i}
            className={cn("hp-tile", t.verified ? "bg-accent" : "bg-brand")}
            style={
              {
                left: `${t.x}%`,
                top: `${t.y}%`,
                width: `${t.size}px`,
                height: `${t.size}px`,
                "--dur": `${t.dur}s`,
                "--delay": `${t.delay}s`,
                "--tmin": t.tmin,
                "--tmax": t.tmax,
                "--rot": `${t.rot}deg`,
                boxShadow: t.verified
                  ? `inset 0 0 0 1px hsl(var(--accent) / 0.5), 0 0 12px hsl(var(--accent) / 0.35)`
                  : undefined,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* readability vignette + top fade */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_35%,hsl(var(--bg)/0.6))]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg to-transparent" />
    </div>
  );
}
