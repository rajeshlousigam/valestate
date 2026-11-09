"use client";

import { useRouter } from "next/navigation";
import type { FC, MouseEvent, ReactNode } from "react";
import { useTheme } from "@/components/theme/theme-provider";
import SpecularButtonBase from "./specular-button";

// The ported component is JS (@ts-nocheck); widen its prop type for TS consumers.
const SpecularButton = SpecularButtonBase as unknown as FC<Record<string, unknown>>;

// The WebGL button takes literal colours, not CSS tokens, so each palette has a preset.
const PRESETS = {
  estara: { tint: "#14100a", textColor: "#f1cf74", lineColor: "#e3b341", baseColor: "#0a0805" },
  classic: { tint: "#0d5647", textColor: "#ffffff", lineColor: "#eab94e", baseColor: "#0a4034" },
} as const;

/**
 * Brand preset of the React Bits SpecularButton — Estara: logo gold on black;
 * Classic: emerald glass with a gold sweep. Handles link navigation via `href`.
 */
export function SpecularCTA({
  children,
  href,
  onClick,
  size = "md",
  className = "",
  type = "button",
  autoAnimate = false,
}: {
  children: ReactNode;
  href?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
  autoAnimate?: boolean;
}) {
  const router = useRouter();
  const { palette } = useTheme();
  const preset = PRESETS[palette];

  return (
    <SpecularButton
      size={size}
      type={type}
      radius={16}
      tint={preset.tint}
      tintOpacity={0.94}
      textColor={preset.textColor}
      lineColor={preset.lineColor}
      baseColor={preset.baseColor}
      intensity={1}
      shineSize={12}
      shineFade={42}
      thickness={1.2}
      proximity={260}
      autoAnimate={autoAnimate}
      className={className}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (href) router.push(href);
      }}
    >
      {children}
    </SpecularButton>
  );
}
