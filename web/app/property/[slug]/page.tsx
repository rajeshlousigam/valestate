import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building,
  CalendarClock,
  Car,
  Check,
  Compass,
  Layers,
  MapPin,
  Maximize,
  Sofa,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/property/gallery";
import { PropertyCard } from "@/components/property/property-card";
import { TrustPanel } from "@/components/property/trust-panel";
import { buttonVariants } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatArea, formatINR, groupINR } from "@/lib/format";
import { PROPERTIES, getProperty, similarProperties } from "@/lib/mock-data";

export function generateStaticParams() {
  return PROPERTIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p) return { title: "Property not found" };
  return {
    title: `${p.title} — ${p.localityName}, Imphal`,
    description: p.description.slice(0, 155),
  };
}

const FURNISH_LABEL: Record<string, string> = {
  UNFURNISHED: "Unfurnished",
  SEMI: "Semi-furnished",
  FURNISHED: "Furnished",
};

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p) notFound();

  const isRent = p.intent === "RENT";
  const specs = [
    p.bedrooms != null && { icon: BedDouble, label: "Bedrooms", value: p.bedrooms },
    p.bathrooms != null && { icon: Bath, label: "Bathrooms", value: p.bathrooms },
    { icon: Maximize, label: "Area", value: formatArea(p.areaSqft) },
    p.floor && { icon: Layers, label: "Floor", value: p.floor },
    p.facing && { icon: Compass, label: "Facing", value: p.facing },
    p.parking != null && { icon: Car, label: "Parking", value: `${p.parking} car${p.parking > 1 ? "s" : ""}` },
    p.furnishing && { icon: Sofa, label: "Furnishing", value: FURNISH_LABEL[p.furnishing] },
    p.ageYears != null && { icon: CalendarClock, label: "Age", value: `${p.ageYears} yr${p.ageYears === 1 ? "" : "s"}` },
  ].filter(Boolean) as { icon: typeof Building; label: string; value: React.ReactNode }[];

  const similar = similarProperties(p);

  return (
    <Container className="pt-8">
      <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Back to search
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* left column */}
        <div>
          <Gallery covers={p.gallery.length ? p.gallery : [p.cover]} />

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-3">
              <VerifiedBadge />
              <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-muted">
                {isRent ? "For Rent" : "For Sale"}
              </span>
              <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-muted">
                {p.type[0] + p.type.slice(1).toLowerCase()}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">{p.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-muted">
              <MapPin className="h-4 w-4" /> {p.address}, {p.localityName}, Imphal
            </p>
          </div>

          {/* specs */}
          <GlassCard className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 p-6 sm:grid-cols-4">
            {specs.map((s) => (
              <div key={s.label}>
                <s.icon className="h-5 w-5 text-brand" />
                <p className="mt-2 text-xs text-subtle">{s.label}</p>
                <p className="font-semibold">{s.value}</p>
              </div>
            ))}
          </GlassCard>

          {/* description */}
          <div className="mt-8">
            <h2 className="text-xl font-bold">About this property</h2>
            <p className="mt-3 leading-relaxed text-fg/80">{p.description}</p>
          </div>

          {/* amenities */}
          {p.amenities.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold">Amenities</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {p.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2.5 text-sm">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-soft text-brand">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* right column (sticky) */}
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <GlassCard panel className="p-6">
            <p className="text-sm text-muted">{isRent ? "Monthly rent" : "Price"}</p>
            <p className="text-3xl font-bold tracking-tight">
              {isRent ? `${groupINR(p.price)}` : formatINR(p.price)}
              {isRent && <span className="text-base font-normal text-subtle">/mo</span>}
            </p>
            {isRent && p.deposit != null && (
              <p className="mt-1 text-sm text-muted">Deposit {groupINR(p.deposit)}</p>
            )}
            {!isRent && (
              <p className="mt-1 text-sm text-muted">{groupINR(Math.round(p.price / p.areaSqft))} / sqft</p>
            )}

            <div className="mt-5 rounded-2xl border border-line p-4">
              <p className="text-xs text-subtle">Listed by verified owner</p>
              <p className="font-semibold">{p.ownerName}</p>
              <p className="mt-1 text-xs text-muted">
                Contact is shared only after you send an inquiry — never sold to brokers.
              </p>
            </div>

            <button className={buttonVariants({ variant: "primary", size: "lg", className: "mt-4 w-full" })}>
              Contact owner
            </button>
            <button className={buttonVariants({ variant: "glass", size: "md", className: "mt-2 w-full" })}>
              Schedule a visit
            </button>
          </GlassCard>

          <TrustPanel property={p} />
        </div>
      </div>

      {/* similar */}
      {similar.length > 0 && (
        <section className="pt-20">
          <SectionHeading eyebrow="You may also like" title="Similar verified listings" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => (
              <PropertyCard key={s.id} property={s} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
