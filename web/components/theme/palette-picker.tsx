"use client";

import { Check, Palette as PaletteIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PALETTES, useTheme } from "./theme-provider";

export function PalettePicker({ className }: { className?: string }) {
  const { palette, setPalette, mounted } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Choose colour theme"
        aria-haspopup="menu"
        aria-expanded={open}
        className="glass grid h-10 w-10 place-items-center rounded-full text-fg/80 transition-all hover:scale-105 hover:text-brand active:scale-95"
      >
        <PaletteIcon className="h-5 w-5" />
      </button>
      {open && mounted && (
        <div role="menu" className="glass-panel animate-fade-up absolute right-0 top-12 z-[70] w-56 rounded-3xl p-2">
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-subtle">Colour theme</p>
          {PALETTES.map((p) => {
            const active = palette === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setPalette(p.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  active ? "bg-brand-soft/70 text-fg" : "text-fg/80 hover:bg-fg/[0.06]",
                )}
              >
                <span
                  aria-hidden
                  className="h-6 w-6 shrink-0 rounded-full ring-1 ring-fg/15"
                  style={{ background: `linear-gradient(135deg, ${p.swatch[0]} 50%, ${p.swatch[1]} 50%)` }}
                />
                <span className="flex-1">{p.label}</span>
                {active && <Check className="h-4 w-4 text-brand" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
