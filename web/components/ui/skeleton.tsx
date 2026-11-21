import { cn } from "@/lib/utils";

/** Pulsing placeholder block used by route loading states. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-2xl bg-fg/[0.07]", className)} />;
}
