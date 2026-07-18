import { cover as coverGradient } from "@/lib/covers";
import { cn } from "@/lib/utils";

/**
 * On-brand gradient "photo" placeholder (self-contained, offline).
 * Swap for real S3/CDN images later — same aspect box.
 */
export function Cover({
  index,
  className,
  children,
  rounded = "rounded-3xl",
}: {
  index: number;
  className?: string;
  children?: React.ReactNode;
  rounded?: string;
}) {
  return (
    <div
      className={cn("relative overflow-hidden", rounded, className)}
      style={{ backgroundImage: coverGradient(index) }}
    >
      {/* soft light streaks for a glassy, dimensional feel */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_10%,rgba(255,255,255,0.35),transparent_45%),radial-gradient(100%_70%_at_90%_90%,rgba(0,0,0,0.25),transparent_50%)]" />
      <div className="absolute -left-10 top-0 h-full w-24 rotate-12 bg-white/20 blur-2xl" />
      {children}
    </div>
  );
}
