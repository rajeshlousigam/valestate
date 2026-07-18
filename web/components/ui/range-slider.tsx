"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  format?: (n: number) => string;
  className?: string;
}

export function RangeSlider({ min, max, step = 1, value, onChange, format, className }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<0 | 1 | null>(null);

  const clamp = useCallback(
    (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step)),
    [min, max, step],
  );
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  useEffect(() => {
    if (drag === null) return;
    const onMove = (e: PointerEvent) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const t = (e.clientX - rect.left) / rect.width;
      const v = clamp(min + t * (max - min));
      if (drag === 0) onChange([Math.min(v, value[1]), value[1]]);
      else onChange([value[0], Math.max(v, value[0])]);
    };
    const onUp = () => setDrag(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, value, onChange, clamp, min, max]);

  const key = (i: 0 | 1) => (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0;
    if (!d) return;
    e.preventDefault();
    const next: [number, number] = [...value];
    next[i] = clamp(value[i] + d);
    if (i === 0) next[0] = Math.min(next[0], value[1]);
    else next[1] = Math.max(next[1], value[0]);
    onChange(next);
  };

  const fmt = format ?? ((n) => String(n));

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-fg">
        <span>{fmt(value[0])}</span>
        <span>{fmt(value[1])}</span>
      </div>
      <div ref={trackRef} className="relative h-1.5 w-full rounded-full bg-fg/10">
        <div
          className="absolute h-1.5 rounded-full brand-gradient"
          style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }}
        />
        {([0, 1] as const).map((i) => (
          <button
            key={i}
            type="button"
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value[i]}
            onKeyDown={key(i)}
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              setDrag(i);
            }}
            className={cn(
              "absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand bg-surface shadow-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25",
              drag === i && "scale-110",
            )}
            style={{ left: `${pct(value[i])}%` }}
          />
        ))}
      </div>
    </div>
  );
}
