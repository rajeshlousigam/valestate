"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { SpecularCTA } from "@/components/ui/specular-cta";
import { formatDate, present } from "@/lib/format";
import { useHistory } from "@/lib/use-history";
import { cn } from "@/lib/utils";

/** myhistory.property_listing_request_history */
export default function MyListingRequests() {
  const { data, error, loading, reload } = useHistory();
  const rows = data?.property_listing_request_history ?? [];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Listing requests</h2>
        <SpecularCTA href="/list-property/new" size="sm"><Plus className="h-4 w-4" /> New request</SpecularCTA>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : error ? (
        <GlassCard className="p-12 text-center">
          <p className="font-semibold">Couldn&apos;t load your requests</p>
          <p className="mt-1 text-sm text-muted">{error}</p>
          <button onClick={reload} className="mt-4 text-sm font-semibold text-brand hover:underline">Try again</button>
        </GlassCard>
      ) : rows.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="font-semibold">No listing requests yet</p>
          <p className="mt-1 text-sm text-muted">Tell us about your property — our team verifies it before it goes live.</p>
          <Link href="/list-property/new" className={cn(buttonVariants({ variant: "primary", size: "md" }), "mt-4")}>Start listing</Link>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <GlassCard key={r.id} className="p-5">
              <p className="font-semibold">{[r.property_type, r.real_estate_type].filter(present).join(" · ")}</p>
              <p className="mt-0.5 text-sm text-muted">{[r.property_address, r.property_district].filter(present).join(", ")}</p>
              {present(r.description) && <p className="mt-2 line-clamp-2 text-sm text-fg/75">{r.description}</p>}
              <p className="mt-2 text-xs text-subtle">Requested {formatDate(r.apply_date)}</p>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
