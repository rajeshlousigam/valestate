"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Container } from "@/components/ui/primitives";
import { api } from "@/lib/api";
import type { ListingSummary, Pagination } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FilterPanel, type Filters, type Masters } from "./filter-panel";
import { PropertyCard } from "./property-card";

const num = (v: string | null) => (v && Number(v) > 0 ? Number(v) : undefined);
const hasFilters = (f: Filters) => Object.values(f).some(Boolean);

type Result = { items: ListingSummary[]; pagination: Pagination | null; error: string | null; loading: boolean };

/**
 * Text search (/masters/searchprop) and structured filters (/masters/filterprop)
 * are separate endpoints that can't be combined, so filters take precedence.
 */
export function SearchClient({ masters }: { masters: Masters }) {
  const params = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => ({
    real_estate_type_id: num(params.get("type")),
    property_type_id: num(params.get("ptype")),
    budget_id: num(params.get("budget")),
    state_id: num(params.get("state")),
    district_id: num(params.get("district")),
  }));
  const [q, setQ] = useState(params.get("q") ?? "");
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [res, setRes] = useState<Result>({ items: [], pagination: null, error: null, loading: true });

  const filtered = hasFilters(filters);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    setRes((r) => ({ ...r, loading: true, error: null }));
    const req = filtered ? api.filter(filters, page) : api.search(debouncedQ.trim(), page);
    req
      .then((r) => {
        if (cancelled) return;
        setRes((prev) => ({
          items: page === 1 ? r.data : [...prev.items, ...r.data],
          pagination: r.pagination,
          error: null,
          loading: false,
        }));
      })
      .catch((e: unknown) => {
        if (!cancelled) setRes((prev) => ({ ...prev, loading: false, error: e instanceof Error ? e.message : "Search failed." }));
      });
    return () => {
      cancelled = true;
    };
  }, [filters, debouncedQ, page, filtered, attempt]);

  const set = (patch: Partial<Filters>) => {
    setPage(1);
    setFilters((f) => ({ ...f, ...patch }));
  };
  const clear = () => {
    setPage(1);
    setFilters({});
  };
  const total = res.pagination?.total ?? res.items.length;

  return (
    <Container className="pt-8">
      <div className="glass-panel flex flex-col gap-3 rounded-4xl p-3 sm:flex-row sm:items-center">
        <label className="glass-input flex flex-1 items-center gap-2 rounded-2xl px-4">
          <Search className="h-5 w-5 shrink-0 text-brand" />
          <span className="sr-only">Search</span>
          <input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            disabled={filtered}
            placeholder={filtered ? "Reset filters to search by text" : "Search by address or city…"}
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-subtle disabled:cursor-not-allowed"
          />
        </label>
        <button
          onClick={() => setDrawer(true)}
          className="glass inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-medium lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="hidden lg:block">
          <GlassCard className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-auto p-6">
            <FilterPanel filters={filters} set={set} masters={masters} onClear={clear} />
          </GlassCard>
        </aside>

        <div>
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-lg font-semibold" aria-live="polite">
              {res.loading && page === 1 ? "Searching…" : `${total} verified ${total === 1 ? "property" : "properties"}`}
            </h1>
          </div>

          {res.error && res.items.length === 0 ? (
            <GlassCard className="grid place-items-center p-16 text-center">
              <p className="text-lg font-semibold">Couldn&apos;t load results</p>
              <p className="mt-1 max-w-sm text-sm text-muted">{res.error}</p>
              <button onClick={() => setAttempt((n) => n + 1)} className="mt-4 text-sm font-semibold text-brand hover:underline">
                Try again
              </button>
            </GlassCard>
          ) : !res.loading && res.items.length === 0 ? (
            <GlassCard className="grid place-items-center p-16 text-center">
              <p className="text-lg font-semibold">No matches</p>
              <p className="mt-1 max-w-sm text-sm text-muted">
                Try clearing some filters. Every listing here is verified — so there are simply fewer, better results.
              </p>
              <button onClick={clear} className="mt-4 text-sm font-semibold text-brand hover:underline">
                Clear all filters
              </button>
            </GlassCard>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {res.items.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
              {res.error && <p role="alert" className="mt-4 text-sm text-red-500">{res.error}</p>}
              {res.pagination?.hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setPage((n) => n + 1)}
                    disabled={res.loading}
                    className={buttonVariants({ variant: "glass", size: "md" })}
                  >
                    {res.loading ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="glass-panel animate-fade-up absolute inset-y-0 right-0 w-[88%] max-w-sm overflow-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold">Filters</span>
              <button onClick={() => setDrawer(false)} aria-label="Close filters" className="glass grid h-9 w-9 place-items-center rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterPanel filters={filters} set={set} masters={masters} onClear={clear} />
            <button
              onClick={() => setDrawer(false)}
              className={cn("mt-6 w-full rounded-full brand-gradient py-3 font-semibold text-white shadow-glow")}
            >
              Show {total} results
            </button>
          </div>
        </div>
      )}
    </Container>
  );
}
