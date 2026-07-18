import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "@/components/property/search-client";

export const metadata: Metadata = {
  title: "Search verified properties in Imphal",
  description:
    "Browse and filter verified properties for sale and rent in Imphal — by locality, budget, type, bedrooms and amenities.",
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-muted">Loading…</div>}>
      <SearchClient />
    </Suspense>
  );
}
