"use client";

import { useState } from "react";
import { cover as coverGradient } from "@/lib/covers";
import { cn } from "@/lib/utils";

/**
 * Listing image with graceful fallback: if `src` is missing or fails to load,
 * the on-brand gradient (picked by `index`) shows through instead.
 */
export function Cover({
  index,
  src,
  alt = "",
  className,
  children,
  rounded = "rounded-3xl",
  overlay = true,
}: {
  index: number;
  src?: string;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
  rounded?: string;
  overlay?: boolean;
}) {
  const [failed, setFailed] = useState<string | null>(null);

  return (
    <div
      className={cn("relative overflow-hidden bg-cover bg-center", rounded, className)}
      style={{ backgroundImage: coverGradient(Math.abs(index)) }}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
    >
      {src && failed !== src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(src)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/5" />
      )}
      {children}
    </div>
  );
}
