"use client";

import { useState } from "react";
import { Cover } from "@/components/ui/cover";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { cn } from "@/lib/utils";

export function Gallery({ images, seed = 0, alt = "" }: { images: string[]; seed?: number; alt?: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      <Cover index={seed} src={images[active]} alt={alt} className="aspect-[16/10] w-full" rounded="rounded-4xl">
        <div className="absolute left-4 top-4">
          <VerifiedBadge className="bg-white/85 text-brand ring-white/60" />
        </div>
      </Cover>
      {images.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === active}
              className={cn(
                "shrink-0 overflow-hidden rounded-2xl ring-2 transition-all",
                i === active ? "ring-brand" : "ring-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Cover index={seed + i} src={src} rounded="rounded-2xl" className="h-16 w-24 sm:h-20 sm:w-28" overlay={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
