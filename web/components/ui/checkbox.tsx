"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CheckboxRow({
  checked,
  onToggle,
  label,
  className,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-sm transition-colors hover:bg-fg/[0.04]",
        className,
      )}
    >
      <span
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all",
          checked ? "border-transparent brand-gradient text-white" : "border-line",
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <span className={cn(checked ? "text-fg" : "text-fg/80")}>{label}</span>
    </button>
  );
}
