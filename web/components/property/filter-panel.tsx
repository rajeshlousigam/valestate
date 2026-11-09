"use client";

import { RotateCcw } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { present } from "@/lib/format";
import type { Budget, District, PropertyTypeOption, RealEstateType, SearchFilters, State } from "@/lib/types";

export type Filters = Omit<SearchFilters, "search">;

export interface Masters {
  realEstateTypes: RealEstateType[];
  propertyTypes: PropertyTypeOption[];
  budgets: Budget[];
  states: State[];
  districts: District[];
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line py-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-sm font-semibold text-fg">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/** Dependent filters per API doc §8: property type + budget depend on the
 *  real-estate type; district depends on state. */
export function FilterPanel({
  filters,
  set,
  masters,
  onClear,
}: {
  filters: Filters;
  set: (patch: Partial<Filters>) => void;
  masters: Masters;
  onClear: () => void;
}) {
  const re = filters.real_estate_type_id;
  const pTypes = masters.propertyTypes.filter((t) => t.real_estate_type_id === re && present(t.type_name));
  const budgets = masters.budgets.filter((b) => b.real_estate_type_id === re && present(b.budget_amount));
  const districts = masters.districts.filter((d) => d.state_id === filters.state_id && present(d.name));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-lg font-bold">Filters</h2>
        <button onClick={onClear} className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-brand">
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      <Group title="Looking to">
        <Chip active={!re} onClick={() => set({ real_estate_type_id: undefined, property_type_id: undefined, budget_id: undefined })}>
          Any
        </Chip>
        {masters.realEstateTypes.map((t) => (
          <Chip
            key={t.id}
            active={re === t.id}
            onClick={() => set({ real_estate_type_id: t.id, property_type_id: undefined, budget_id: undefined })}
          >
            {t.type_name}
          </Chip>
        ))}
      </Group>

      {re && pTypes.length > 0 && (
        <Group title="Property type">
          <Chip active={!filters.property_type_id} onClick={() => set({ property_type_id: undefined })}>Any</Chip>
          {pTypes.map((t) => (
            <Chip key={t.id} active={filters.property_type_id === t.id} onClick={() => set({ property_type_id: t.id })}>
              {t.type_name}
            </Chip>
          ))}
        </Group>
      )}

      {re && budgets.length > 0 && (
        <Group title="Budget">
          <Chip active={!filters.budget_id} onClick={() => set({ budget_id: undefined })}>Any</Chip>
          {budgets.map((b) => (
            <Chip key={b.id} active={filters.budget_id === b.id} onClick={() => set({ budget_id: b.id })}>
              {b.budget_amount}
            </Chip>
          ))}
        </Group>
      )}

      <Group title="State">
        <Chip active={!filters.state_id} onClick={() => set({ state_id: undefined, district_id: undefined })}>Any</Chip>
        {masters.states.map((s) => (
          <Chip key={s.id} active={filters.state_id === s.id} onClick={() => set({ state_id: s.id, district_id: undefined })}>
            {s.name}
          </Chip>
        ))}
      </Group>

      {filters.state_id && districts.length > 0 && (
        <Group title="District">
          <Chip active={!filters.district_id} onClick={() => set({ district_id: undefined })}>Any</Chip>
          {districts.map((d) => (
            <Chip key={d.id} active={filters.district_id === d.id} onClick={() => set({ district_id: d.id })}>
              {d.name}
            </Chip>
          ))}
        </Group>
      )}
    </div>
  );
}
