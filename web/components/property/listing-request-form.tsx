"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { buttonVariants } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input, Label } from "@/components/ui/field";
import { GlassCard } from "@/components/ui/glass-card";
import { SpecularCTA } from "@/components/ui/specular-cta";
import { ApiError, api } from "@/lib/api";
import { present } from "@/lib/format";
import type { Masters } from "./filter-panel";

/** POST /masters/propertylistingrequest — the ops team follows up to verify. */
export function ListingRequestForm({ masters }: { masters: Masters }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reType, setReType] = useState<number | null>(null);
  const [pType, setPType] = useState<number | null>(null);
  const [stateId, setStateId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return <p className="py-16 text-center text-muted">Loading…</p>;

  const pTypes = masters.propertyTypes.filter((t) => t.real_estate_type_id === reType && present(t.type_name));
  const districts = masters.districts.filter((d) => d.state_id === stateId && present(d.name));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!reType || !pType || !districtId) return setError("Choose a purpose, property type and district.");
    if (address.trim().length < 3) return setError("Add the property address.");
    if (description.trim().length < 10) return setError("Describe the property (10+ characters).");
    setBusy(true);
    setError(null);
    try {
      const r = await api.requestListing({
        real_estate_type_master_id: reType,
        property_type_master_id: pType,
        property_district_id: districtId,
        property_address: address.trim(),
        property_description: description.trim(),
      });
      setDone(typeof r.msg === "string" ? r.msg : "Request submitted.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return router.push("/login");
      setError(err instanceof Error ? err.message : "Could not submit your request.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <GlassCard panel className="mx-auto max-w-xl p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full brand-gradient text-white shadow-glow">
          <Check className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-2xl font-bold">Request submitted</h2>
        <p className="mt-2 text-muted">{done} Our team will contact you to verify the property.</p>
        <Link href="/account/listings" className={buttonVariants({ variant: "glass", size: "md", className: "mt-6" })}>
          View my requests
        </Link>
      </GlassCard>
    );
  }

  return (
    <GlassCard panel className="mx-auto max-w-3xl p-6 sm:p-8">
      <form onSubmit={submit} className="space-y-6">
        <Field label="Purpose">
          {masters.realEstateTypes.map((t) => (
            <Chip key={t.id} active={reType === t.id} onClick={() => { setReType(t.id); setPType(null); }}>
              {t.type_name}
            </Chip>
          ))}
        </Field>
        {reType && (
          <Field label="Property type">
            {pTypes.map((t) => (
              <Chip key={t.id} active={pType === t.id} onClick={() => setPType(t.id)}>{t.type_name}</Chip>
            ))}
          </Field>
        )}
        <Field label="State">
          {masters.states.map((s) => (
            <Chip key={s.id} active={stateId === s.id} onClick={() => { setStateId(s.id); setDistrictId(null); }}>
              {s.name}
            </Chip>
          ))}
        </Field>
        {stateId && (
          <Field label="District">
            {districts.map((d) => (
              <Chip key={d.id} active={districtId === d.id} onClick={() => setDistrictId(d.id)}>{d.name}</Chip>
            ))}
          </Field>
        )}
        <div>
          <Label htmlFor="lr-address">Address</Label>
          <Input id="lr-address" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Locality, landmark" />
        </div>
        <div>
          <Label htmlFor="lr-desc">Description</Label>
          <textarea
            id="lr-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
            placeholder="Size, rooms, price expectation…"
            className="glass-input w-full rounded-2xl bg-transparent p-4 text-sm outline-none placeholder:text-subtle"
          />
        </div>
        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        <SpecularCTA size="lg" type="submit" className="w-full justify-center">
          {busy ? "Submitting…" : "Submit request"}
        </SpecularCTA>
      </form>
    </GlassCard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}
