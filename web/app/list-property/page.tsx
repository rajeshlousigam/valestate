import { BadgeCheck, FileCheck2, PhoneCall, ScanFace } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { SpecularCTA } from "@/components/ui/specular-cta";

export const metadata: Metadata = {
  title: "List your property",
  description: "List your property in Imphal on HousePoint and get the verified badge.",
};

const STEPS = [
  { icon: FileCheck2, title: "Add your property", desc: "Details, photos and ownership documents." },
  { icon: ScanFace, title: "We verify you", desc: "Documents + identity, reviewed by our ops team." },
  { icon: PhoneCall, title: "A quick call", desc: "We confirm the details and availability." },
  { icon: BadgeCheck, title: "You go live", desc: "Verified badge, genuine buyers, no broker spam." },
];

export default function ListPropertyPage() {
  return (
    <Container className="pt-12">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>For owners · Free at launch</Eyebrow>
        <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          List your property, the <span className="brand-text">verified</span> way.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Reach genuine buyers in Imphal. Every HousePoint listing is verified before it goes
          public — which is exactly why buyers trust it.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <SpecularCTA size="lg" autoAnimate>
            Start listing
          </SpecularCTA>
          <Link href="/search" className={buttonVariants({ variant: "glass", size: "lg" })}>
            Browse listings
          </Link>
        </div>
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-4">
        {STEPS.map((s, i) => (
          <GlassCard key={s.title} className="relative p-6">
            <span className="absolute right-5 top-4 text-5xl font-bold text-fg/[0.06]">{i + 1}</span>
            <span className="grid h-12 w-12 place-items-center rounded-2xl brand-gradient text-white shadow-glow">
              <s.icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-semibold">{s.title}</h3>
            <p className="mt-1.5 text-sm text-muted">{s.desc}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard panel className="mx-auto mt-14 max-w-2xl p-8 text-center">
        <p className="text-sm text-muted">
          The owner submission flow connects to the HousePoint verification API
          (Property → Verification → Publish). This front-end is wired for mock data today;
          the API is already built and tested.
        </p>
      </GlassCard>
    </Container>
  );
}
