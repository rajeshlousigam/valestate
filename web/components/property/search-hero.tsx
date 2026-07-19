"use client";

import { MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Select } from "@/components/ui/field";
import { SpecularCTA } from "@/components/ui/specular-cta";
import { LOCALITIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "SALE", label: "Buy" },
  { key: "RENT", label: "Rent" },
  { key: "COMMERCIAL", label: "Commercial" },
  { key: "LAND", label: "Land" },
] as const;

export function SearchHero() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("SALE");
  const [locality, setLocality] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");

  function submit() {
    const p = new URLSearchParams();
    if (tab === "COMMERCIAL" || tab === "LAND") p.set("type", tab);
    else p.set("intent", tab);
    if (locality) p.set("locality", locality);
    if (type && tab !== "COMMERCIAL" && tab !== "LAND") p.set("type", type);
    if (budget) p.set("maxPrice", budget);
    router.push(`/search?${p.toString()}`);
  }

  const isRent = tab === "RENT";
  const budgets = isRent
    ? [
        { v: "15000", l: "Up to ₹15K/mo" },
        { v: "25000", l: "Up to ₹25K/mo" },
        { v: "40000", l: "Up to ₹40K/mo" },
      ]
    : [
        { v: "5000000", l: "Up to ₹50 L" },
        { v: "10000000", l: "Up to ₹1 Cr" },
        { v: "20000000", l: "Up to ₹2 Cr" },
      ];

  return (
    <div className="glass-panel rounded-4xl p-2.5 sm:rounded-5xl">
      {/* tabs */}
      <div className="mb-2.5 flex gap-1 rounded-full bg-fg/[0.04] p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all",
              tab === t.key ? "brand-gradient text-white shadow-glow" : "text-fg/70 hover:text-fg",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* fields */}
      <div className="grid gap-2.5 p-1 md:grid-cols-[1.4fr_1fr_1fr_auto]">
        <div className="glass-input flex items-center gap-2 rounded-2xl px-4">
          <MapPin className="h-5 w-5 shrink-0 text-brand" />
          <select
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            className="h-11 w-full cursor-pointer appearance-none bg-transparent text-sm text-fg outline-none"
          >
            <option value="">All localities in Imphal</option>
            {LOCALITIES.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name} · {l.area}
              </option>
            ))}
          </select>
        </div>

        <Select value={type} onChange={(e) => setType(e.target.value)} disabled={tab === "COMMERCIAL" || tab === "LAND"}>
          <option value="">Property type</option>
          <option value="RESIDENTIAL">Residential</option>
          <option value="COMMERCIAL">Commercial</option>
          <option value="LAND">Land / Plot</option>
        </Select>

        <Select value={budget} onChange={(e) => setBudget(e.target.value)}>
          <option value="">Budget</option>
          {budgets.map((b) => (
            <option key={b.v} value={b.v}>
              {b.l}
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
