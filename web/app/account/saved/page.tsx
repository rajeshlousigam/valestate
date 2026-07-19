"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { Cover } from "@/components/ui/cover";
import { GlassCard } from "@/components/ui/glass-card";
import { formatINR, formatRent } from "@/lib/format";
import { useSaved } from "@/lib/saved";

export default function Saved() {
  const { items, toggle } = useSaved();

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold">Saved properties</h2>
      {items.length === 0 ? (
        <GlassCard className="p-12 text-center text-muted">
          Nothing saved yet. Tap the heart on any listing to keep it here.{" "}
          <Link href="/search" className="font-semibold text-brand">Browse →</Link>
        </GlassCard>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((it) => (
            <div key={it.slug} className="group relative">
              <Link href={`/property/${it.slug}`} className="card-hover block rounded-4xl">
                <GlassCard className="overflow-hidden">
                  <Cover index={it.cover} alt={it.title} className="aspect-[16/10]" rounded="rounded-none" />
                  <div className="p-4">
                    <p className="font-bold">{it.intent === "RENT" ? formatRent(it.price) : formatINR(it.price)}</p>
                    <p className="mt-0.5 line-clamp-1 text-sm font-medium">{it.title}</p>
                    <p className="text-xs text-muted">{it.locality}, Imphal</p>
                  </div>
                </GlassCard>
              </Link>
              <button
                onClick={() => toggle(it)}
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-red-500/70"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
