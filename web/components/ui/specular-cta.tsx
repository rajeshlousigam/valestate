"use client";

import { useRouter } from "next/navigation";
import type { FC, MouseEvent, ReactNode } from "react";
import SpecularButtonBase from "./specular-button";

// The ported component is JS (@ts-nocheck); widen its prop type for TS consumers.
const SpecularButton = SpecularButtonBase as unknown as FC<Record<string, unknown>>;

/**
 * Brand preset of the React Bits SpecularButton — emerald glass fill with a
 * Kangla-gold specular sweep. Handles link navigation via `href`.
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
      tint="#0d5647"
      tintOpacity={0.94}
      textColor="#ffffff"
      lineColor="#eab94e"
      baseColor="#0a4034"
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
