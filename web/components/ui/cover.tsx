"use client";

import { useState } from "react";
import { cover as coverGradient } from "@/lib/covers";
import { photo as photoUrl } from "@/lib/photos";
import { cn } from "@/lib/utils";

/**
 * Listing image with graceful fallback: shows a royalty-free photo, and if it
 * fails to load (offline / 404) the on-brand gradient shows through instead.
 */
export function Cover({
  index,
  src,
  alt = "",
  width = 800,
  className,
  children,
  rounded = "rounded-3xl",
  overlay = true,
}: {
  index: number;
  src?: string;
  alt?: string;
  width?: number;
  className?: string;
  children?: React.ReactNode;
  rounded?: string;
  overlay?: boolean;
}) {
  const [ok, setOk] = useState(true);
  const url = src ?? photoUrl(index, width);

  return (
    <div
      className={cn("relative overflow-hidden bg-cover bg-center", rounded, className)}
      style={{ backgroundImage: coverGradient(index) }}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
    >
      {ok && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setOk(false)}
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
