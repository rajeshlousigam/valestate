"use client";

import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusPill } from "@/components/account/status-pill";
import { buttonVariants } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { SpecularCTA } from "@/components/ui/specular-cta";
import { USE_API, api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

type Row = { id: string; title: string; type: string; intent: string; status: string; price?: { amountMinor: number } };

const MOCK: Row[] = [
  { id: "m1", title: "3 BHK Apartment, Thangmeiband", type: "RESIDENTIAL", intent: "SALE", status: "PUBLISHED", price: { amountMinor: 8500000 } },
  { id: "m2", title: "2 BHK Flat, Uripok", type: "RESIDENTIAL", intent: "RENT", status: "SUBMITTED", price: { amountMinor: 18000 } },
  { id: "m3", title: "Commercial Shop, Porompat", type: "COMMERCIAL", intent: "RENT", status: "REJECTED", price: { amountMinor: 35000 } },
];

export default function MyListings() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    (async () => {
      if (!USE_API) return setRows(MOCK);
      try {
        const d = await api.myProperties();
        setRows(d.data);
      } catch {
        setRows([]);
      }
    })();
  }, []);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">My listings</h2>
        <SpecularCTA href="/list-property/new" size="sm"><Plus className="h-4 w-4" /> Add property</SpecularCTA>
      </div>

      {rows === null ? (
        <p className="text-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="font-semibold">No properties yet</p>
          <p className="mt-1 text-sm text-muted">List your first property — it goes live once verified.</p>
          <Link href="/list-property/new" className={cn(buttonVariants({ variant: "primary", size: "md" }), "mt-4")}>Start listing</Link>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <GlassCard key={r.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{r.title}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {r.type[0] + r.type.slice(1).toLowerCase()} · {r.intent === "RENT" ? "For rent" : "For sale"}
                  {r.price && <> · {formatINR(r.price.amountMinor)}{r.intent === "RENT" && "/mo"}</>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={r.status} />
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-subtle">
        Statuses reflect our verification process: submitted → under verification → published (or rejected with a reason).
      </p>
    </div>
  );
}
