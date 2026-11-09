import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { PropertyCard } from "@/components/property/property-card";
import { HeroBanner } from "@/components/home/hero-banner";
import { SkylineDivider } from "@/components/home/skyline-divider";
import { SearchHero } from "@/components/property/search-hero";
import { buttonVariants } from "@/components/ui/button";
import { Cover } from "@/components/ui/cover";
import { GlassCard } from "@/components/ui/glass-card";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/primitives";
import { SpecularCTA } from "@/components/ui/specular-cta";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { api, assetUrl, fetchMasters } from "@/lib/api";
import { present } from "@/lib/format";
import type { ListingSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export const revalidate = 300;

// Each section degrades to hidden if its endpoint fails or is empty.
const safe = <T,>(p: Promise<T[]>) => p.catch((): T[] => []);

export default async function Home() {
  const [masters, banners, stats, enquiry, booking, howVerify, whyTrust] = await Promise.all([
    fetchMasters(),
    safe(api.banners()),
    safe(api.stats()),
    safe(api.latestEnquiry()),
    safe(api.latestBooking()),
    safe(api.howVerify()),
    safe(api.whyTrust()),
  ]);
  const how = howVerify[0];
  const districts = masters.districts.filter((d) => present(d.name));
  const why = whyTrust[0];

  return (
    <>
      {/* ---------- HERO: banner (≈½ screen), then headline + search ---------- */}
      {banners.length > 0 && (
        <HeroBanner slides={banners.map((b) => ({ id: b.id, title: b.title, body: b.body, image: assetUrl("banner", b.image) }))} />
      )}
      <SkylineDivider className={banners.length > 0 ? "pt-2" : "pt-6"} />
      <section className="pt-4 sm:pt-5">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="animate-fade-up text-balance text-2xl font-bold leading-tight tracking-tight sm:text-4xl">
              Find a home you can <span className="brand-text">actually trust</span>.
            </h1>
            <p className="animate-fade-up mx-auto mt-2 text-balance text-sm text-fg/70 sm:text-base">
              Every listing verified before it goes public — no fakes, no duplicates, no brokers.
            </p>
          </div>
          <div className="animate-fade-up mx-auto mt-5 max-w-4xl">
            <SearchHero masters={masters} />
          </div>
          <div className="mt-5 flex justify-center">
            <Eyebrow>
              <Sparkles className="h-3.5 w-3.5" /> Verified real estate · Imphal, Manipur
            </Eyebrow>
          </div>
        </Container>
      </section>

      {/* ---------- TRUST STATS ---------- */}
      {stats.length > 0 && (
        <section className="pt-10 sm:pt-12">
          <Container>
            <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3">
              {stats.map((s) => (
                <GlassCard key={s.id} className="min-w-[160px] max-w-xs flex-1 p-5 text-center">
                  <p className="text-2xl font-bold brand-text sm:text-3xl">{s.header}</p>
                  <p className="mt-1 text-xs text-muted">{s.body}</p>
                </GlassCard>
              ))}
            </div>
          </Container>
        </section>
      )}

      <ListingSection
        eyebrow="Fresh"
        title="Newly listed properties"
        subtitle="Verified properties across Imphal, ready to enquire about."
        items={enquiry}
      />
      <ListingSection
        eyebrow="Visit in person"
        title="Book a site visit"
        subtitle="Pick a time slot and see the property today."
        items={booking}
        booking
      />

      {/* ---------- HOW IT WORKS ---------- */}
      {how && (
        <section id="how-it-works" className="scroll-mt-24 pt-24">
          <Container>
            <SectionHeading align="center" eyebrow="How verification works" title={how.header} subtitle={how.short_notes} />
            <div className="mt-12 grid gap-5 md:grid-cols-4">
              {how.types.map((step, i) => (
                <GlassCard key={step.id} className="relative p-6">
                  <span className="absolute right-5 top-5 text-5xl font-bold text-fg/[0.06]">{i + 1}</span>
                  <Icon src={assetUrl("landing", step.icon)} />
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{step.notes}</p>
                </GlassCard>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ---------- BROWSE BY PURPOSE ---------- */}
      {masters.realEstateTypes.length > 0 && (
        <section className="pt-24">
          <Container>
            <SectionHeading eyebrow="Browse" title="What are you looking for?" />
            {/* Type images are square (1:1) and often small icons, so cards stay square and modest in size. */}
            <div className="mt-8 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
              {masters.realEstateTypes.map((t) => (
                <Link key={t.id} href={`/search?type=${t.id}`} className="card-hover glass group block overflow-hidden rounded-4xl">
                  <Cover
                    index={t.id}
                    src={assetUrl("realestate", t.real_estate_img)}
                    alt={t.type_name}
                    className="aspect-square"
                    rounded="rounded-none"
                    overlay={false}
                  />
                  <div className="flex items-center justify-between gap-2 px-4 py-3.5 sm:px-5">
                    <h3 className="font-semibold text-fg group-hover:text-brand sm:text-lg">{t.type_name}</h3>
                    <ArrowRight className="h-4 w-4 shrink-0 text-brand transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ---------- BROWSE BY DISTRICT ---------- */}
      {districts.length > 0 && (
        <section className="pt-24">
          <Container>
            <SectionHeading eyebrow="Neighbourhoods" title="Browse by district" subtitle="Jump straight to verified properties in your area." />
            <div className="mt-8 flex flex-wrap gap-3">
              {districts.map((d) => (
                <Link
                  key={d.id}
                  href={`/search?state=${d.state_id}&district=${d.id}`}
                  className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:text-brand"
                >
                  <MapPin className="h-4 w-4 text-brand" /> {d.name}
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ---------- WHY ---------- */}
      {why && (
        <section id="why" className="scroll-mt-24 pt-24">
          <Container>
            <SectionHeading align="center" eyebrow={why.header} title={why.short_notes} />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {why.types.map((w) => (
                <GlassCard key={w.id} panel className="p-7">
                  <Icon src={assetUrl("landing", w.icon)} />
                  <h3 className="mt-4 text-lg font-semibold">{w.title}</h3>
                  <p className="mt-2 text-sm text-muted">{w.short_description}</p>
                </GlassCard>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ---------- CTA ---------- */}
      <section className="pt-24">
        <Container>
          <GlassCard panel className="relative overflow-hidden rounded-5xl p-10 text-center sm:p-16">
            <div className="relative">
              <VerifiedBadge className="mx-auto" label="Verified before it goes live" />
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                Own a property in Imphal? List it — verified.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted">
                Tell us about your property and our team will verify it before it reaches genuine buyers.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <SpecularCTA href="/list-property" size="lg">
                  List your property <ArrowRight className="h-5 w-5" />
                </SpecularCTA>
                <Link href="/search" className={buttonVariants({ variant: "glass", size: "lg" })}>
                  Browse listings
                </Link>
              </div>
            </div>
          </GlassCard>
        </Container>
      </section>
    </>
  );
}

function ListingSection({
  eyebrow,
  title,
  subtitle,
  items,
  booking = false,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: ListingSummary[];
  booking?: boolean;
}) {
  if (!items.length) return null;
  return (
    <section className="pt-24">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
          <Link href="/search" className={cn(buttonVariants({ variant: "glass", size: "sm" }), "hidden shrink-0 sm:inline-flex")}>
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <PropertyCard key={p.id} property={p} booking={booking} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function Icon({ src }: { src?: string }) {
  return (
    <span
      className={cn(
        // Off-white tile so the full-colour icon artwork reads cleanly in every theme.
        "grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-white via-stone-50 to-stone-200 shadow-sm ring-1 ring-black/5",
      )}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-7 w-7 object-contain" loading="lazy" />
      )}
    </span>
  );
}
