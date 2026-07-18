import { Bath, BedDouble, Heart, MapPin, Maximize } from "lucide-react";
import Link from "next/link";
import { Cover } from "@/components/ui/cover";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatArea, formatINR, formatRent, relativeDate } from "@/lib/format";
import type { Property } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
  LAND: "Land",
};

export function PropertyCard({ property, className }: { property: Property; className?: string }) {
  const price =
    property.intent === "RENT" ? formatRent(property.price) : formatINR(property.price);

  return (
    <Link
      href={`/property/${property.slug}`}
      className={cn("group card-hover block rounded-4xl", className)}
    >
      <article className="glass overflow-hidden rounded-4xl">
        <Cover index={property.cover} rounded="rounded-none" className="aspect-[16/11]">
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <span className="rounded-full bg-black/25 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
              {property.intent === "RENT" ? "For Rent" : "For Sale"} · {TYPE_LABEL[property.type]}
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/35">
              <Heart className="h-4 w-4" />
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
            <VerifiedBadge size="sm" className="bg-white/85 text-brand ring-white/60" />
            <span className="rounded-full bg-black/25 px-2.5 py-1 text-xs text-white backdrop-blur-md">
              {relativeDate(property.postedAt)}
            </span>
          </div>
        </Cover>

        <div className="p-5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xl font-bold tracking-tight">
              {price}
              {property.intent === "RENT" && (
                <span className="ml-1 text-xs font-normal text-subtle">deposit {formatINR(property.deposit ?? 0)}</span>
              )}
            </p>
          </div>
          <h3 className="mt-1 line-clamp-1 font-semibold text-fg group-hover:text-brand">
            {property.title}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-3.5 w-3.5" /> {property.localityName}, Imphal
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-sm text-muted">
            {property.bedrooms != null && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="h-4 w-4 text-brand" /> {property.bedrooms} Beds
              </span>
            )}
            {property.bathrooms != null && (
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-brand" /> {property.bathrooms} Baths
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Maximize className="h-4 w-4 text-brand" /> {formatArea(property.areaSqft)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
