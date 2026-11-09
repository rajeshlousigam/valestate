import { CalendarCheck, MapPin } from "lucide-react";
import Link from "next/link";
import { SaveButton } from "@/components/property/save-button";
import { Cover } from "@/components/ui/cover";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { assetUrl } from "@/lib/api";
import { present, relativeDate } from "@/lib/format";
import type { ListingSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export function listingTitle(p: ListingSummary): string {
  return [present(p.property_type) ? p.property_type : null, p.real_estate_type].filter(Boolean).join(" · ");
}

export function listingLocality(p: ListingSummary): string {
  return [p.city_name, p.district_name].filter(present).join(", ");
}

export function PropertyCard({
  property: p,
  booking = false,
  className,
}: {
  property: ListingSummary;
  booking?: boolean;
  className?: string;
}) {
  const thumb = assetUrl("property", p.thumbnail);
  const title = listingTitle(p);
  const locality = listingLocality(p);

  return (
    <Link href={`/property/${p.slug}`} className={cn("group card-hover block rounded-4xl", className)}>
      <article className="glass overflow-hidden rounded-4xl">
        <Cover index={p.id} src={thumb} alt={title} rounded="rounded-none" className="aspect-[16/11]">
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <span className="rounded-full bg-black/25 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
              {p.real_estate_type}
            </span>
            <SaveButton item={{ slug: p.slug, title, thumbnail: thumb, subtitle: p.real_estate_type, locality }} />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
            <VerifiedBadge size="sm" className="bg-white/85 text-brand ring-white/60" />
            <span className="rounded-full bg-black/25 px-2.5 py-1 text-xs text-white backdrop-blur-md">
              {relativeDate(p.date_listed)}
            </span>
          </div>
        </Cover>

        <div className="p-5">
          <h3 className="line-clamp-1 font-semibold text-fg group-hover:text-brand">{title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{p.property_address ? `${p.property_address} · ${locality}` : locality}</span>
          </p>
          {booking && (
            <p className="mt-4 flex items-center gap-1.5 border-t border-line pt-4 text-sm font-medium text-brand">
              <CalendarCheck className="h-4 w-4" /> Site visits bookable
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
