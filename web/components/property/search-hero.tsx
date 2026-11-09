"use client";

import { MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Select } from "@/components/ui/field";
import { SpecularCTA } from "@/components/ui/specular-cta";
import { present } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Masters } from "./filter-panel";

export function SearchHero({ masters }: { masters: Masters }) {
  const router = useRouter();
  const [type, setType] = useState<number | null>(masters.realEstateTypes[0]?.id ?? null);
  const [district, setDistrict] = useState("");
  const [ptype, setPtype] = useState("");
  const [budget, setBudget] = useState("");

  const pTypes = masters.propertyTypes.filter((t) => t.real_estate_type_id === type && present(t.type_name));
  const budgets = masters.budgets.filter((b) => b.real_estate_type_id === type && present(b.budget_amount));
  const districts = masters.districts.filter((d) => present(d.name));
  const stateName = (id: number) => masters.states.find((s) => s.id === id)?.name;

  function submit() {
    const p = new URLSearchParams();
    if (type) p.set("type", String(type));
    if (ptype) p.set("ptype", ptype);
    if (budget) p.set("budget", budget);
    const d = districts.find((x) => String(x.id) === district);
    if (d) {
      p.set("state", String(d.state_id));
      p.set("district", String(d.id));
    }
    router.push(`/search?${p.toString()}`);
  }

  return (
    <div className="glass-panel rounded-4xl p-2.5 sm:rounded-5xl">
      {masters.realEstateTypes.length > 0 && (
        <div className="mb-2.5 flex gap-1 rounded-full bg-fg/[0.04] p-1" role="tablist">
          {masters.realEstateTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={type === t.id}
              onClick={() => {
                setType(t.id);
                setPtype("");
                setBudget("");
              }}
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                type === t.id ? "brand-gradient text-white shadow-glow" : "text-fg/70 hover:text-fg",
              )}
            >
              {t.type_name}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-2.5 p-1 md:grid-cols-[1.4fr_1fr_1fr_auto]">
        <label className="glass-input flex items-center gap-2 rounded-2xl px-4">
          <MapPin className="h-5 w-5 shrink-0 text-brand" />
          <span className="sr-only">District</span>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="h-11 w-full cursor-pointer appearance-none bg-transparent text-sm text-fg outline-none"
          >
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
                {stateName(d.state_id) ? ` · ${stateName(d.state_id)}` : ""}
              </option>
            ))}
          </select>
        </label>

        <Select aria-label="Property type" value={ptype} onChange={(e) => setPtype(e.target.value)} disabled={!pTypes.length}>
          <option value="">Property type</option>
          {pTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.type_name}
            </option>
          ))}
        </Select>

        <Select aria-label="Budget" value={budget} onChange={(e) => setBudget(e.target.value)} disabled={!budgets.length}>
          <option value="">Budget</option>
          {budgets.map((b) => (
            <option key={b.id} value={b.id}>
              {b.budget_amount}
            </option>
          ))}
        </Select>

        <SpecularCTA size="md" onClick={submit} className="w-full justify-center md:w-auto md:px-8">
          <Search className="h-5 w-5" />
          <span>Search</span>
        </SpecularCTA>
      </div>
    </div>
  );
}
