import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** The signature ValEstate trust marker (docs/16 §8). */
export function VerifiedBadge({
  className,
  size = "md",
  label = "Verified",
}: {
  className?: string;
  size?: "sm" | "md";
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-brand/10 font-semibold text-brand ring-1 ring-inset ring-brand/20 backdrop-blur",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      <BadgeCheck className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {label}
    </span>
  );
}
