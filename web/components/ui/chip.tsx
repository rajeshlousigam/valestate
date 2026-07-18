"use client";

import { cn } from "@/lib/utils";

export function Chip({
  active,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all active:scale-95",
        active
          ? "border-transparent brand-gradient text-white shadow-glow"
          : "border-line bg-transparent text-fg/80 hover:border-brand/40 hover:text-brand",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
