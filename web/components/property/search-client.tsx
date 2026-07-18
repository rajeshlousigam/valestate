"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Select } from "@/components/ui/field";
import { GlassCard } from "@/components/ui/glass-card";
import { Container } from "@/components/ui/primitives";
import { PROPERTIES } from "@/lib/mock-data";
import type { Intent, PropertyType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FilterPanel, type Filters, defaultFilters } from "./filter-panel";
import { PropertyCard } from "./property-card";

function boundsFor(intent: "" | Intent): [number, number] {
  const pool = PROPERTIES.filter((p) => !intent || p.intent === intent).map((p) => p.price);
  return [Math.min(...pool), Math.max(...pool)];
}

export function SearchClient() {
  const params = useSearchParams();
  const initialIntent = (params.get("intent") as Intent | null) ?? "";
  const initialType = params.get("type") as PropertyType | null;
  const initialLocality = params.get("locality");

  const [filters, setFilters] = useState<Filters>(() => ({
    ...defaultFilters(boundsFor(initialIntent)),
    intent: initialIntent,
    types: initialType ? [initialType] : [],
    localities: initialLocality ? [initialLocality] : [],
  }));
  const [drawer, setDrawer] = useState(false);

  const bounds = useMemo(() => boundsFor(filters.intent), [filters.intent]);
  const boundsKey = bounds.join("-");

  // reset the budget range when the intent (and thus price scale) changes
  useEffect(() => {
    setFilters((f) => ({ ...f, price: bounds }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundsKey]);

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const clear = () => setFilters(defaultFilters(boundsFor("")));

  const results = useMemo(() => {
    let r = PROPERTIES.slice();
    if (filters.intent) r = r.filter((p) => p.intent === filters.intent);
    if (filters.types.length) r = r.filter((p) => filters.types.includes(p.type));
    if (filters.localities.length) r = r.filter((p) => filters.localities.includes(p.localitySlug));
    r = r.filter((p) => p.price >= filters.price[0] && p.price <= filters.price[1]);
    if (filters.bedrooms) r = r.filter((p) => (p.bedrooms ?? 0) >= filters.bedrooms);
    if (filters.bathrooms) r = r.filter((p) => (p.bathrooms ?? 0) >= filters.bathrooms);
    if (filters.furnishing.length) r = r.filter((p) => p.furnishing && filters.furnishing.includes(p.furnishing));
    if (filters.amenities.length) r = r.filter((p) => filters.amenities.every((a) => p.amenities.includes(a)));
    if (filters.q.trim()) {
      const q = filters.q.toLowerCase();
      r = r.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.localityName.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q),
      );
    }
    switch (filters.sort) {
      case "newest":
        r.sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
        break;
      case "price-asc":
        r.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        r.sort((a, b) => b.price - a.price);
        break;
    }
    return r;
  }, [filters]);

  return (
    <Container className="pt-8">
      {/* search + sort bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-4xl p-3 sm:flex-row sm:items-center">
        <div className="glass-input flex flex-1 items-center gap-2 rounded-2xl px-4">
          <Search className="h-4.5 w-4.5 shrink-0 text-brand" />
          <input
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Search by title, locality or address…"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-subtle"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawer(true)}
            className="glass inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-medium lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <Select value={filters.sort} onChange={(e) => set({ sort: e.target.value as Filters["sort"] })} className="w-auto min-w-[150px]">
            <option value="relevance">Sort: Relevance</option>
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </Select>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* desktop sidebar */}
        <aside className="hidden lg:block">
          <GlassCard className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-auto p-6">
            <FilterPanel filters={filters} set={set} bounds={bounds} onClear={clear} />
          </GlassCard>
        </aside>

        {/* results */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-lg font-semibold">
              {results.length} verified {results.length === 1 ? "property" : "properties"}
              <span className="text-muted"> in Imphal</span>
            </h1>
          </div>

          {results.length === 0 ? (
            <GlassCard className="grid place-items-center p-16 text-center">
              <p className="text-lg font-semibold">No matches</p>
              <p className="mt-1 max-w-sm text-sm text-muted">
                Try widening your budget or clearing some filters. Every listing here is verified — so there are simply fewer, better results.
              </p>
              <button onClick={clear} className="mt-4 text-sm font-semibold text-brand hover:underline">
                Clear all filters
              </button>
            </GlassCard>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="glass-panel animate-fade-up absolute inset-y-0 right-0 w-[88%] max-w-sm overflow-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold">Filters</span>
              <button onClick={() => setDrawer(false)} className="glass grid h-9 w-9 place-items-center rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterPanel filters={filters} set={set} bounds={bounds} onClear={clear} />
            <button
              onClick={() => setDrawer(false)}
              className={cn("mt-6 w-full rounded-full brand-gradient py-3 font-semibold text-white shadow-glow")}
            >
              Show {results.length} results
            </button>
          </div>
        </div>
      )}
    </Container>
  );
}
