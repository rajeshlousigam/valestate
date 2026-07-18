"use client";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  FileCheck2,
  ImagePlus,
  MapPin,
  PhoneCall,
  Plus,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { CheckboxRow } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/chip";
import { Input, Label, Select } from "@/components/ui/field";
import { GlassCard } from "@/components/ui/glass-card";
import { SpecularCTA } from "@/components/ui/specular-cta";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { groupINR } from "@/lib/format";
import { AMENITIES, LOCALITIES } from "@/lib/mock-data";
import { photo } from "@/lib/photos";
import type { Furnishing, Intent, PropertyType } from "@/lib/types";
import { cn } from "@/lib/utils";

type Draft = {
  intent: Intent | "";
  type: PropertyType | "";
  localitySlug: string;
  address: string;
  pincode: string;
  title: string;
  description: string;
  price: string;
  deposit: string;
  areaValue: string;
  bedrooms: string;
  bathrooms: string;
  furnishing: Furnishing | "";
  amenities: string[];
  photos: { id: string; src: string }[];
  ownershipDocs: string[];
  identityDocs: string[];
};

const EMPTY: Draft = {
  intent: "",
  type: "",
  localitySlug: "",
  address: "",
  pincode: "",
  title: "",
  description: "",
  price: "",
  deposit: "",
  areaValue: "",
  bedrooms: "",
  bathrooms: "",
  furnishing: "",
  amenities: [],
  photos: [],
  ownershipDocs: [],
  identityDocs: [],
};

const STEPS = ["Type", "Location", "Details", "Photos", "Documents", "Review"] as const;

export function ListingWizard() {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(EMPTY);
  const [submitted, setSubmitted] = useState<{ caseId: string } | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const ownInput = useRef<HTMLInputElement>(null);
  const idInput = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<Draft>) => setD((p) => ({ ...p, ...patch }));
  const isResidential = d.type === "RESIDENTIAL";

  const valid = useMemo(() => {
    switch (step) {
      case 0:
        return !!d.intent && !!d.type;
      case 1:
        return !!d.localitySlug && d.address.trim().length > 2;
      case 2:
        return d.title.trim().length > 4 && !!d.price && !!d.areaValue &&
          (!isResidential || (!!d.bedrooms && !!d.bathrooms));
      case 3:
        return d.photos.length >= 1;
      case 4:
        return d.ownershipDocs.length >= 1;
      case 5:
        return true;
      default:
        return false;
    }
  }, [step, d, isResidential]);

  function next() {
    if (!valid) return;
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else submit();
  }
  function submit() {
    // No API — simulate submission + verification-case creation.
    const caseId = "VE-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    setSubmitted({ caseId });
  }
  function reset() {
    setD(EMPTY);
    setStep(0);
    setSubmitted(null);
  }

  function addSamplePhotos() {
    const base = d.photos.length;
    const add = Array.from({ length: 3 }, (_, i) => ({
      id: `s${base + i}-${Date.now()}`,
      src: photo(base + i + 3, 600),
    }));
    set({ photos: [...d.photos, ...add] });
  }
  function onPickPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const add = files.map((f, i) => ({ id: `f${Date.now()}-${i}`, src: URL.createObjectURL(f) }));
    set({ photos: [...d.photos, ...add] });
    e.target.value = "";
  }
  function toggleAmenity(a: string) {
    set({ amenities: d.amenities.includes(a) ? d.amenities.filter((x) => x !== a) : [...d.amenities, a] });
  }

  if (submitted) return <SubmittedScreen caseId={submitted.caseId} draft={d} onReset={reset} />;

  return (
    <div className="mx-auto max-w-3xl">
      <Stepper step={step} />

      <GlassCard panel className="mt-6 p-6 sm:p-8">
        {/* ---------------- STEP 0: Type ---------------- */}
        {step === 0 && (
          <StepShell title="What are you listing?" hint="You can only list a property you own — we'll verify it.">
            <Label>Intent</Label>
            <div className="mb-5 flex flex-wrap gap-2">
              <Chip active={d.intent === "SALE"} onClick={() => set({ intent: "SALE" })}>For Sale</Chip>
              <Chip active={d.intent === "RENT"} onClick={() => set({ intent: "RENT" })}>For Rent</Chip>
            </div>
            <Label>Property type</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              {(["RESIDENTIAL", "COMMERCIAL", "LAND"] as PropertyType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set({ type: t })}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all",
                    d.type === t ? "border-brand bg-brand-soft/50 ring-2 ring-brand/30" : "border-line hover:border-brand/40",
                  )}
                >
                  <p className="font-semibold">{t[0] + t.slice(1).toLowerCase()}</p>
                  <p className="text-xs text-muted">
                    {t === "RESIDENTIAL" ? "Flat, house, duplex" : t === "COMMERCIAL" ? "Shop, office, showroom" : "Plot / land"}
                  </p>
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {/* ---------------- STEP 1: Location ---------------- */}
        {step === 1 && (
          <StepShell title="Where is it?" hint="Launch city is Imphal — pick the locality.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Locality</Label>
                <Select value={d.localitySlug} onChange={(e) => set({ localitySlug: e.target.value })}>
                  <option value="">Select locality</option>
                  {LOCALITIES.map((l) => (
                    <option key={l.slug} value={l.slug}>{l.name} · {l.area}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Pincode</Label>
                <Input value={d.pincode} onChange={(e) => set({ pincode: e.target.value })} placeholder="795001" inputMode="numeric" />
              </div>
            </div>
            <div className="mt-4">
              <Label>Address / landmark</Label>
              <Input value={d.address} onChange={(e) => set({ address: e.target.value })} placeholder="e.g. Near DM College, Thangmeiband" />
            </div>
          </StepShell>
        )}

        {/* ---------------- STEP 2: Details ---------------- */}
        {step === 2 && (
          <StepShell title="Tell us about it" hint="Accurate details get verified faster.">
            <Label>Listing title</Label>
            <Input value={d.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Spacious 3 BHK with valley view" />
            <div className="mt-4">
              <Label>Description</Label>
              <textarea
                value={d.description}
                onChange={(e) => set({ description: e.target.value })}
                rows={3}
                placeholder="Highlight what makes it special…"
                className="glass-input w-full rounded-2xl bg-transparent p-3 text-sm outline-none placeholder:text-subtle"
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <Label>{d.intent === "RENT" ? "Monthly rent (₹)" : "Price (₹)"}</Label>
                <Input value={d.price} onChange={(e) => set({ price: e.target.value.replace(/\D/g, "") })} placeholder={d.intent === "RENT" ? "18000" : "8500000"} inputMode="numeric" />
              </div>
              {d.intent === "RENT" && (
                <div>
                  <Label>Deposit (₹)</Label>
                  <Input value={d.deposit} onChange={(e) => set({ deposit: e.target.value.replace(/\D/g, "") })} placeholder="54000" inputMode="numeric" />
                </div>
              )}
              <div>
                <Label>Area (sqft)</Label>
                <Input value={d.areaValue} onChange={(e) => set({ areaValue: e.target.value.replace(/\D/g, "") })} placeholder="1100" inputMode="numeric" />
              </div>
            </div>

            {isResidential && (
              <>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Bedrooms</Label>
                    <div className="flex flex-wrap gap-2">
                      {["1", "2", "3", "4", "5"].map((n) => (
                        <Chip key={n} active={d.bedrooms === n} onClick={() => set({ bedrooms: n })}>{n}</Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Bathrooms</Label>
                    <div className="flex flex-wrap gap-2">
                      {["1", "2", "3", "4"].map((n) => (
                        <Chip key={n} active={d.bathrooms === n} onClick={() => set({ bathrooms: n })}>{n}</Chip>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Furnishing</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["UNFURNISHED", "SEMI", "FURNISHED"] as Furnishing[]).map((f) => (
                      <Chip key={f} active={d.furnishing === f} onClick={() => set({ furnishing: f })}>
                        {f === "SEMI" ? "Semi-furnished" : f[0] + f.slice(1).toLowerCase()}
                      </Chip>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="mt-4">
              <Label>Amenities</Label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((a) => (
                  <Chip key={a} active={d.amenities.includes(a)} onClick={() => toggleAmenity(a)}>{a}</Chip>
                ))}
              </div>
            </div>
          </StepShell>
        )}

        {/* ---------------- STEP 3: Photos ---------------- */}
        {step === 3 && (
          <StepShell title="Add photos" hint="At least 1 photo. Real, current photos verify faster.">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => photoInput.current?.click()}
                className="glass flex h-28 w-40 flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line text-sm text-muted hover:border-brand/50 hover:text-brand"
              >
                <ImagePlus className="h-6 w-6" /> Upload photos
              </button>
              <button
                type="button"
                onClick={addSamplePhotos}
                className="glass flex h-28 w-40 flex-col items-center justify-center gap-1.5 rounded-2xl text-sm text-muted hover:text-brand"
              >
                <Plus className="h-6 w-6" /> Add sample photos
              </button>
              <input ref={photoInput} type="file" accept="image/*" multiple hidden onChange={onPickPhotos} />
            </div>

            {d.photos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {d.photos.map((p) => (
                  <div key={p.id} className="group relative aspect-square overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => set({ photos: d.photos.filter((x) => x.id !== p.id) })}
                      className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </StepShell>
        )}

        {/* ---------------- STEP 4: Documents ---------------- */}
        {step === 4 && (
          <StepShell title="Verify ownership" hint="Required for verification. Stored privately — never shown publicly or sold to brokers.">
            <DocUpload
              icon={FileCheck2}
              title="Ownership document"
              subtitle="Sale deed / patta / tax receipt / rent agreement"
              files={d.ownershipDocs}
              required
              onPick={() => ownInput.current?.click()}
              onRemove={(name) => set({ ownershipDocs: d.ownershipDocs.filter((x) => x !== name) })}
              inputRef={ownInput}
              onFiles={(names) => set({ ownershipDocs: [...d.ownershipDocs, ...names] })}
            />
            <div className="mt-4">
              <DocUpload
                icon={ScanFace}
                title="Identity document"
                subtitle="Aadhaar / PAN / Voter ID / Passport (optional now)"
                files={d.identityDocs}
                onPick={() => idInput.current?.click()}
                onRemove={(name) => set({ identityDocs: d.identityDocs.filter((x) => x !== name) })}
                inputRef={idInput}
                onFiles={(names) => set({ identityDocs: [...d.identityDocs, ...names] })}
              />
            </div>
            <p className="mt-5 flex items-start gap-2 rounded-2xl bg-brand-soft/50 p-3 text-xs text-fg/70">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              Documents are used only for verification and are access-controlled &amp; audited. They never appear on the public listing.
            </p>
          </StepShell>
        )}

        {/* ---------------- STEP 5: Review ---------------- */}
        {step === 5 && <ReviewStep d={d} />}

        {/* ---- nav ---- */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={step === 0 ? "invisible" : ""}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-3">
            {!valid && <span className="hidden text-xs text-subtle sm:inline">Complete this step to continue</span>}
            <span className={valid ? "" : "pointer-events-none opacity-50"}>
              <SpecularCTA size="md" onClick={next}>
                {step === STEPS.length - 1 ? (
                  <>Submit for verification <BadgeCheck className="h-4 w-4" /></>
                ) : (
                  <>Continue <ArrowRight className="h-4 w-4" /></>
                )}
              </SpecularCTA>
            </span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

/* ---------------- sub-components ---------------- */

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex flex-1 items-center gap-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors",
                i < step ? "brand-gradient text-white" : i === step ? "bg-brand/15 text-brand ring-2 ring-brand/40" : "bg-fg/5 text-subtle",
              )}
            >
              {i < step ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("hidden text-sm font-medium sm:inline", i === step ? "text-fg" : "text-subtle")}>{s}</span>
          </div>
          {i < STEPS.length - 1 && <span className={cn("h-px flex-1", i < step ? "bg-brand/50" : "bg-line")} />}
        </div>
      ))}
    </div>
  );
}

function StepShell({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function DocUpload({
  icon: Icon,
  title,
  subtitle,
  files,
  required,
  onPick,
  onRemove,
  inputRef,
  onFiles,
}: {
  icon: typeof FileCheck2;
  title: string;
  subtitle: string;
  files: string[];
  required?: boolean;
  onPick: () => void;
  onRemove: (name: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFiles: (names: string[]) => void;
}) {
  return (
    <div className="rounded-2xl border border-line p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">
              {title} {required && <span className="text-accent">*</span>}
            </p>
            <p className="text-xs text-muted">{subtitle}</p>
          </div>
        </div>
        <button type="button" onClick={onPick} className={buttonVariants({ variant: "outline", size: "sm" })}>
          <Upload className="h-4 w-4" /> Choose
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          hidden
          onChange={(e) => {
            const names = Array.from(e.target.files ?? []).map((f) => f.name);
            if (names.length) onFiles(names);
            e.target.value = "";
          }}
        />
      </div>
      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((name) => (
            <li key={name} className="flex items-center justify-between gap-2 rounded-lg bg-fg/[0.04] px-3 py-1.5 text-sm">
              <span className="flex items-center gap-2 truncate"><Check className="h-3.5 w-3.5 text-brand" /> {name}</span>
              <button type="button" onClick={() => onRemove(name)} className="text-subtle hover:text-fg">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReviewStep({ d }: { d: Draft }) {
  const localityName = LOCALITIES.find((l) => l.slug === d.localitySlug)?.name ?? d.localitySlug;
  const rows: [string, string][] = [
    ["Listing", `${d.intent === "RENT" ? "For Rent" : "For Sale"} · ${d.type ? d.type[0] + d.type.slice(1).toLowerCase() : ""}`],
    ["Location", `${d.address}, ${localityName}, Imphal ${d.pincode}`.trim()],
    [d.intent === "RENT" ? "Rent" : "Price", d.price ? groupINR(Number(d.price)) + (d.intent === "RENT" ? "/mo" : "") : "—"],
    ...(d.intent === "RENT" && d.deposit ? ([["Deposit", groupINR(Number(d.deposit))]] as [string, string][]) : []),
    ["Area", d.areaValue ? `${Number(d.areaValue).toLocaleString("en-IN")} sqft` : "—"],
    ...(d.type === "RESIDENTIAL" ? ([["Config", `${d.bedrooms || "-"} BHK · ${d.bathrooms || "-"} bath · ${d.furnishing ? (d.furnishing === "SEMI" ? "Semi-furnished" : d.furnishing.toLowerCase()) : "—"}`]] as [string, string][]) : []),
    ["Amenities", d.amenities.length ? d.amenities.join(", ") : "—"],
    ["Photos", `${d.photos.length} added`],
    ["Documents", `${d.ownershipDocs.length} ownership · ${d.identityDocs.length} identity`],
  ];
  return (
    <StepShell title="Review & submit" hint="Check everything — then our team verifies before it goes public.">
      <h3 className="text-lg font-semibold">{d.title || "Untitled listing"}</h3>
      {d.description && <p className="mt-1 text-sm text-muted">{d.description}</p>}
      {d.photos.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {d.photos.slice(0, 6).map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.id} src={p.src} alt="" className="h-20 w-28 shrink-0 rounded-xl object-cover" />
          ))}
        </div>
      )}
      <dl className="mt-5 divide-y divide-line rounded-2xl border border-line">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm">
            <dt className="text-subtle">{k}</dt>
            <dd className="text-right font-medium text-fg">{v}</dd>
          </div>
        ))}
      </dl>
    </StepShell>
  );
}

function SubmittedScreen({ caseId, draft, onReset }: { caseId: string; draft: Draft; onReset: () => void }) {
  const timeline = [
    { icon: FileCheck2, label: "Document review", done: false },
    { icon: ScanFace, label: "Identity check", done: false },
    { icon: PhoneCall, label: "Confirmation call", done: false },
    { icon: BadgeCheck, label: "Published — verified", done: false },
  ];
  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl brand-gradient text-white shadow-glow">
        <Check className="h-8 w-8" strokeWidth={3} />
      </div>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">Submitted for verification</h1>
      <p className="mx-auto mt-2 max-w-md text-muted">
        Thanks! <span className="font-medium text-fg">{draft.title || "Your property"}</span> is now with our
        operations team. Reference <span className="font-mono font-semibold text-brand">{caseId}</span>.
      </p>

      <GlassCard className="mt-8 p-6 text-left">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-brand" /> What happens next
        </div>
        <ul className="mt-4 space-y-3">
          {timeline.map((t) => (
            <li key={t.label} className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand">
                <t.icon className="h-5 w-5" />
              </span>
              <span className="text-sm text-fg/85">{t.label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 flex items-center gap-2 rounded-2xl bg-brand-soft/50 p-3 text-xs text-fg/70">
          <VerifiedBadge size="sm" label="Verified within 1 business day" />
        </p>
      </GlassCard>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={onReset} className={buttonVariants({ variant: "primary", size: "md" })}>
          List another property
        </button>
        <Link href="/search" className={buttonVariants({ variant: "glass", size: "md" })}>
          Browse listings
        </Link>
      </div>
      <p className="mt-6 text-xs text-subtle">Demo flow — no data is saved and no request is sent.</p>
    </div>
  );
}
