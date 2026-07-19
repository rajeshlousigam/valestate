"use client";

import { Heart } from "lucide-react";
import { type SavedItem, useSaved } from "@/lib/saved";
import { cn } from "@/lib/utils";

export function SaveButton({ item, className }: { item: SavedItem; className?: string }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(item.slug);
  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved" : "Save"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full backdrop-blur-md transition-colors",
        saved ? "bg-red-500/80 text-white" : "bg-white/20 text-white hover:bg-white/35",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} />
    </button>
  );
}
