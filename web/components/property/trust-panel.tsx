import { BadgeCheck, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type { Property } from "@/lib/types";

/** Surfaces *what* was verified — the auditable differentiator (docs/02 §12, docs/16 §8). */
export function TrustPanel({ property }: { property: Property }) {
  const verifiedOn = new Date(property.verifiedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl brand-gradient text-white shadow-glow">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <p className="font-semibold">Verified by ValEstate</p>
          <p className="text-xs text-muted">Checked on {verifiedOn}</p>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {property.verifiedChecks.map((check) => (
          <li key={check} className="flex items-center gap-2.5 text-sm">
            <BadgeCheck className="h-4.5 w-4.5 shrink-0 text-brand" />
            <span className="text-fg/85">{check}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 rounded-2xl bg-brand-soft/60 p-3 text-xs leading-relaxed text-fg/70">
        This property passed a human verification review before being published.
        We confirm ownership, identity, and details — so you never chase a fake listing.
      </p>
    </GlassCard>
  );
}
