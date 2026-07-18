import { ArrowRight, Building2, FileCheck2, LandPlot, PhoneCall, ScanFace, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { PropertyCard } from "@/components/property/property-card";
import { SearchHero } from "@/components/property/search-hero";
import { buttonVariants } from "@/components/ui/button";
import { Cover } from "@/components/ui/cover";
import { GlassCard } from "@/components/ui/glass-card";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/primitives";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { LOCALITIES, PROPERTIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const featured = PROPERTIES.filter((p) => p.featured).slice(0, 6);

const STATS = [
  { value: "100%", label: "Verified before public" },
  { value: `${LOCALITIES.length}+`, label: "Localities in Imphal" },
  { value: "0", label: "Broker calls" },
  { value: "<1 day", label: "Avg. verification" },
];

const STEPS = [
  { icon: FileCheck2, title: "Owner submits", desc: "The owner uploads the property with ownership documents." },
  { icon: ScanFace, title: "We verify identity + docs", desc: "Our ops team checks the documents and the owner's identity." },
  { icon: PhoneCall, title: "We call to confirm", desc: "A quick call confirms the details are real and available." },
  { icon: ShieldCheck, title: "It goes live — verified", desc: "Only then does the listing appear, with a verified badge." },
];

const TYPES = [
  { type: "RESIDENTIAL", label: "Homes & Flats", desc: "Apartments, houses & duplexes", icon: Building2, href: "/search?type=RESIDENTIAL", cover: 0 },
  { type: "COMMERCIAL", label: "Commercial", desc: "Shops, offices & showrooms", icon: TrendingUp, href: "/search?type=COMMERCIAL", cover: 7 },
  { type: "LAND", label: "Land & Plots", desc: "Verified-title plots", icon: LandPlot, href: "/search?type=LAND", cover: 5 },
];

const WHY = [
  { icon: ShieldCheck, title: "No fake listings", desc: "Every property is human-verified before you ever see it. What you see is real and available." },
  { icon: PhoneCall, title: "No broker spam", desc: "Talk to the actual owner. Your number is never sold to a wall of brokers." },
  { icon: Sparkles, title: "No duplicates", desc: "One canonical listing per property — no more the-same-flat-six-times." },
];

export default function Home() {
  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative pt-14 sm:pt-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow className="animate-fade-up">
              <Sparkles className="h-3.5 w-3.5" /> Verified real estate · Imphal, Manipur
            </Eyebrow>
            <h1 className="animate-fade-up mt-5 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Find a home you can <span className="brand-text">actually trust</span>.
            </h1>
            <p className="animate-fade-up mx-auto mt-5 max-w-xl text-balance text-lg text-muted">
              Every listing on HousePoint is verified by our team — documents, identity and a
              real call — before it goes public. No fakes, no duplicates, no brokers.
            </p>
          </div>

          <div className="animate-fade-up mx-auto mt-10 max-w-4xl">
            <SearchHero />
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s) => (
              <GlassCard key={s.label} className="p-5 text-center">
                <p className="text-2xl font-bold brand-text sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-muted">{s.label}</p>
              </GlassCard>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- FEATURED LISTINGS ---------- */}
      <section className="pt-24">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Handpicked"
              title="Featured verified listings"
              subtitle="Freshly verified properties across Imphal, ready to explore."
            />
            <Link href="/search" className={cn(buttonVariants({ variant: "glass", size: "sm" }), "hidden shrink-0 sm:inline-flex")}>
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how-it-works" className="scroll-mt-24 pt-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="How verification works"
            title="Why a listing here means something"
            subtitle="Other portals let anyone post anything. We don't. Here's the gate every property passes through."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {STEPS.map((step, i) => (
              <GlassCard key={step.title} className="relative p-6">
                <span className="absolute right-5 top-5 text-5xl font-bold text-fg/[0.06]">{i + 1}</span>
                <span className="grid h-12 w-12 place-items-center rounded-2xl brand-gradient text-white shadow-glow">
                  <step.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{step.desc}</p>
              </GlassCard>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- BROWSE BY TYPE ---------- */}
      <section className="pt-24">
        <Container>
          <SectionHeading eyebrow="Browse" title="What are you looking for?" />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {TYPES.map((t) => (
              <Link key={t.type} href={t.href} className="card-hover block rounded-4xl">
                <Cover index={t.cover} className="aspect-[16/9]" rounded="rounded-4xl">
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20 text-white backdrop-blur-md">
                      <t.icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-3 text-xl font-bold text-white">{t.label}</h3>
                    <p className="text-sm text-white/80">{t.desc}</p>
                  </div>
                </Cover>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- LOCALITIES ---------- */}
      <section className="pt-24">
        <Container>
          <SectionHeading eyebrow="Neighbourhoods" title="Popular localities in Imphal" />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {LOCALITIES.map((l) => (
              <Link key={l.slug} href={`/search?locality=${l.slug}`} className="card-hover block rounded-3xl">
                <Cover index={l.cover} className="aspect-[4/3]" rounded="rounded-3xl">
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <h3 className="font-semibold text-white">{l.name}</h3>
                    <p className="text-xs text-white/80">{l.listings} verified · {l.area}</p>
                  </div>
                </Cover>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- WHY ---------- */}
      <section id="why" className="scroll-mt-24 pt-24">
        <Container>
          <SectionHeading align="center" eyebrow="The HousePoint difference" title="Trust, built into every listing" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {WHY.map((w) => (
              <GlassCard key={w.title} panel className="p-7">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
                  <w.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{w.title}</h3>
                <p className="mt-2 text-sm text-muted">{w.desc}</p>
              </GlassCard>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="pt-24">
        <Container>
          <GlassCard panel className="relative overflow-hidden rounded-5xl p-10 text-center sm:p-16">
            <Cover index={4} className="absolute inset-0 opacity-25" rounded="rounded-none" />
            <div className="relative">
              <VerifiedBadge className="mx-auto" label="Free verification at launch" />
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                Own a property in Imphal? List it — verified.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted">
                Get the verified badge, reach genuine buyers, and manage every inquiry in one place.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/list-property" className={buttonVariants({ variant: "primary", size: "lg" })}>
                  List your property <ArrowRight className="h-5 w-5" />
                </Link>
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
