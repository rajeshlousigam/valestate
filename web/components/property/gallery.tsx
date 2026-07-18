"use client";

import { useState } from "react";
import { Cover } from "@/components/ui/cover";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { cn } from "@/lib/utils";

export function Gallery({ covers, alt = "" }: { covers: number[]; alt?: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      <Cover index={covers[active]} alt={alt} width={1200} className="aspect-[16/10] w-full" rounded="rounded-4xl">
        <div className="absolute left-4 top-4">
          <VerifiedBadge className="bg-white/85 text-brand ring-white/60" />
        </div>
      </Cover>
      {covers.length > 1 && (
        <div className="flex gap-3">
          {covers.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "overflow-hidden rounded-2xl ring-2 transition-all",
                i === active ? "ring-brand" : "ring-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Cover index={c} rounded="rounded-2xl" className="h-16 w-24" overlay={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
