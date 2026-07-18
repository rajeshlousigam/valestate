import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "glass" | "outline" | "ghost" | "soft";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "brand-gradient text-white shadow-glow hover:brightness-110 hover:-translate-y-0.5",
  glass: "glass text-fg hover:text-brand hover:scale-[1.02]",
  outline: "border border-line bg-transparent text-fg hover:bg-fg/[0.04]",
  ghost: "text-fg/80 hover:bg-fg/[0.06] hover:text-fg",
  soft: "bg-brand-soft text-brand hover:brightness-105",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base [--h:3.25rem] h-[var(--h)]",
  icon: "h-10 w-10",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  ),
);
Button.displayName = "Button";
