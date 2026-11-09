import { ArrowLeft, Building, Check, MapPin, Tag, User, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Gallery } from "@/components/property/gallery";
import { PropertyActions } from "@/components/property/property-actions";
import { ShareButton } from "@/components/property/share-button";
import { TrustPanel } from "@/components/property/trust-panel";
import { GlassCard } from "@/components/ui/glass-card";
import { Container } from "@/components/ui/primitives";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { api, assetUrl, isBookingMode } from "@/lib/api";
import { costLabel, formatINR, present } from "@/lib/format";
import type { HowVerify } from "@/lib/types";

export const revalidate = 300;

// Deduped between generateMetadata and the page render.
const getDetail = cache((slug: string) => api.detail(slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDetail(slug).catch(() => null);
  if (!d) return { title: "Property not found" };
  const p = d.property;
  return {
    title: `${p.title_property} — ${[p.city_name, p.district_name].filter(present).join(", ")}`,
    description: (p.about_property || p.address).slice(0, 155),
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [data, howVerify] = await Promise.all([
    getDetail(slug),
    api.howVerify().then((b): HowVerify | undefined => b[0]).catch(() => undefined),
  ]);
  if (!data) notFound();

  const p = data.property;
  const booking = isBookingMode(p.request_mode);
  const images = data.images.map((i) => assetUrl("property", i.prop_img)).filter((u): u is string => !!u);
  const price = costLabel(p.rent_or_cost, p.rent_cost_type);
  const deposit = Number(p.deposit) > 0 ? formatINR(Number(p.deposit)) : null;
  const location = [p.address, p.city_name, p.district_name, p.state_name].filter(present).join(", ");

  const specs = [
    { icon: Tag, label: "Purpose", value: p.real_estate_type },
    present(p.property_type) && { icon: Building, label: "Type", value: p.property_type },
    deposit && { icon: Wallet, label: "Deposit", value: deposit },
    present(p.owner_name) && { icon: User, label: "Owner", value: p.owner_name },
  ].filter(Boolean) as { icon: typeof Building; label: string; value: string }[];

  return (
    <Container className="pt-8">
      <div className="flex items-center justify-between gap-3">
        <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-brand">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>
        <ShareButton title={p.title_property} />
      </div>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Gallery images={images} seed={p.id} alt={p.title_property} />

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-3">
              <VerifiedBadge />
              <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-muted">{p.real_estate_type}</span>
              {present(p.property_type) && (
                <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-muted">{p.property_type}</span>
              )}
            </div>
            <h1 className="mt-3 text-balance text-2xl font-bold tracking-tight sm:text-3xl">{p.title_property}</h1>
            <p className="mt-2 flex items-start gap-1.5 text-sm text-muted sm:text-base">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> <span>{location}</span>
            </p>
          </div>

          <GlassCard className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 p-5 sm:grid-cols-4 sm:p-6">
            {specs.map((s) => (
              <div key={s.label} className="min-w-0">
                <s.icon className="h-5 w-5 text-brand" />
                <p className="mt-2 text-xs text-subtle">{s.label}</p>
                <p className="break-words font-semibold">{s.value}</p>
              </div>
            ))}
          </GlassCard>

          {present(p.about_property) && (
            <div className="mt-8">
              <h2 className="text-xl font-bold">About this property</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-fg/80">{p.about_property}</p>
            </div>
          )}

          {data.features.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold">Features</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {data.features.map((f) => (
                  <div key={f.id} className="flex items-center gap-2.5 text-sm">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-soft text-brand">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    {f.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <GlassCard panel className="scroll-mt-24 p-6" id="actions">
            <p className="text-sm text-muted">{booking ? "Site visit" : "Price"}</p>
            <p className="text-3xl font-bold tracking-tight">{price ?? "On request"}</p>
            {deposit && <p className="mt-1 text-sm text-muted">Deposit {deposit}</p>}
            <PropertyActions propertyId={p.id} booking={booking} slots={data.time_slots} />
          </GlassCard>

          <TrustPanel listedOn={p.date_listed} howVerify={howVerify} />
        </div>
      </div>

      {/* Phones: the action panel sits below the fold, so keep the CTA in reach. */}
      <div className="glass-nav fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 px-4 py-3 lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">{p.real_estate_type}</p>
          <p className="truncate font-bold">{price ?? "Price on request"}</p>
        </div>
        <a href="#actions" className="rounded-full brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow">
          {booking ? "Book visit" : "Enquire"}
        </a>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />
    </Container>
  );
}
