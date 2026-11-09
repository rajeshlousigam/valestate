import { BadgeCheck, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { formatDate } from "@/lib/format";
import type { HowVerify } from "@/lib/types";

/** Verification explainer; steps come from GET /masters/howverify. */
export function TrustPanel({ listedOn, howVerify }: { listedOn: string; howVerify?: HowVerify }) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl brand-gradient text-white shadow-glow">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <p className="font-semibold">{howVerify?.header ?? "Verified listing"}</p>
          <p className="text-xs text-muted">Published {formatDate(listedOn)}</p>
        </div>
      </div>

      {howVerify?.types.length ? (
        <ul className="mt-5 space-y-3">
          {howVerify.types.map((step) => (
            <li key={step.id} className="flex gap-2.5 text-sm">
              <BadgeCheck className="h-5 w-5 shrink-0 text-brand" />
              <span>
                <span className="font-medium text-fg/90">{step.title}</span>
                <span className="block text-xs text-muted">{step.notes}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {howVerify?.short_notes && (
        <p className="mt-5 rounded-2xl bg-brand-soft/60 p-3 text-xs leading-relaxed text-fg/70">{howVerify.short_notes}</p>
      )}
    </GlassCard>
  );
}
