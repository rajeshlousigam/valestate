"use client";

import { useRouter } from "next/navigation";
import type { FC, MouseEvent, ReactNode } from "react";
import SpecularButtonBase from "./specular-button";

// The ported component is JS (@ts-nocheck); widen its prop type for TS consumers.
const SpecularButton = SpecularButtonBase as unknown as FC<Record<string, unknown>>;

// The WebGL button takes literal colours, not CSS tokens: Estara teal + logo gold.
const PRESET = { tint: "#1c4955", textColor: "#f6e3a8", lineColor: "#e8c568", baseColor: "#123540" } as const;

/**
 * Brand preset of the React Bits SpecularButton — Estara teal glass with a
 * logo-gold specular sweep. Handles link navigation via `href`.
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

  return (
    <SpecularButton
      size={size}
      type={type}
      radius={16}
      tint={PRESET.tint}
      tintOpacity={0.94}
      textColor={PRESET.textColor}
      lineColor={PRESET.lineColor}
      baseColor={PRESET.baseColor}
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
