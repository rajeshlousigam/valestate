"use client";

import { RotateCcw } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { CheckboxRow } from "@/components/ui/checkbox";
import { RangeSlider } from "@/components/ui/range-slider";
import { formatINR } from "@/lib/format";
import { AMENITIES, LOCALITIES } from "@/lib/mock-data";
import type { Furnishing, Intent, PropertyType } from "@/lib/types";

export interface Filters {
  intent: "" | Intent;
  types: PropertyType[];
  localities: string[];
  price: [number, number];
  bedrooms: number;
  bathrooms: number;
  furnishing: Furnishing[];
  amenities: string[];
  q: string;
  sort: "relevance" | "newest" | "price-asc" | "price-desc";
}

export function defaultFilters(bounds: [number, number]): Filters {
  return {
    intent: "",
    types: [],
    localities: [],
    price: bounds,
    bedrooms: 0,
    bathrooms: 0,
    furnishing: [],
    amenities: [],
    q: "",
    sort: "relevance",
  };
}

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line py-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-sm font-semibold text-fg">{title}</h3>
      {children}
    </div>
  );
}

const FURNISHING: { v: Furnishing; l: string }[] = [
  { v: "UNFURNISHED", l: "Unfurnished" },
  { v: "SEMI", l: "Semi-furnished" },
  { v: "FURNISHED", l: "Furnished" },
];

export function FilterPanel({
  filters,
  set,
  bounds,
  onClear,
}: {
  filters: Filters;
  set: (patch: Partial<Filters>) => void;
  bounds: [number, number];
  onClear: () => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-lg font-bold">Filters</h2>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-brand"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      <Group title="Looking to">
        <div className="flex flex-wrap gap-2">
          <Chip active={filters.intent === ""} onClick={() => set({ intent: "" })}>Any</Chip>
          <Chip active={filters.intent === "SALE"} onClick={() => set({ intent: "SALE" })}>Buy</Chip>
          <Chip active={filters.intent === "RENT"} onClick={() => set({ intent: "RENT" })}>Rent</Chip>
        </div>
      </Group>

      <Group title="Property type">
        <div className="flex flex-wrap gap-2">
          {(["RESIDENTIAL", "COMMERCIAL", "LAND"] as PropertyType[]).map((t) => (
            <Chip key={t} active={filters.types.includes(t)} onClick={() => set({ types: toggle(filters.types, t) })}>
              {t[0] + t.slice(1).toLowerCase()}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Budget">
        <RangeSlider
          min={bounds[0]}
          max={bounds[1]}
          step={filters.intent === "RENT" ? 1000 : 100000}
          value={filters.price}
          onChange={(v) => set({ price: v })}
          format={formatINR}
        />
      </Group>

      <Group title="Bedrooms">
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4].map((n) => (
            <Chip key={n} active={filters.bedrooms === n} onClick={() => set({ bedrooms: n })}>
              {n === 0 ? "Any" : `${n}+`}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Bathrooms">
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3].map((n) => (
            <Chip key={n} active={filters.bathrooms === n} onClick={() => set({ bathrooms: n })}>
              {n === 0 ? "Any" : `${n}+`}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Furnishing">
        <div className="space-y-0.5">
          {FURNISHING.map((f) => (
            <CheckboxRow
              key={f.v}
              label={f.l}
              checked={filters.furnishing.includes(f.v)}
              onToggle={() => set({ furnishing: toggle(filters.furnishing, f.v) })}
            />
          ))}
        </div>
      </Group>

      <Group title="Locality">
        <div className="max-h-56 space-y-0.5 overflow-auto pr-1">
          {LOCALITIES.map((l) => (
            <CheckboxRow
              key={l.slug}
              label={`${l.name}`}
              checked={filters.localities.includes(l.slug)}
              onToggle={() => set({ localities: toggle(filters.localities, l.slug) })}
            />
          ))}
        </div>
      </Group>

      <Group title="Amenities">
        <div className="space-y-0.5">
          {AMENITIES.map((a) => (
            <CheckboxRow
              key={a}
              label={a}
              checked={filters.amenities.includes(a)}
              onToggle={() => set({ amenities: toggle(filters.amenities, a) })}
            />
          ))}
        </div>
      </Group>
    </div>
  );
}
