import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "@/components/property/search-client";
import { fetchMasters } from "@/lib/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Search verified properties",
  description: "Browse and filter verified properties for sale, rent and site visits — by purpose, type, budget and district.",
};

export default async function SearchPage() {
  const masters = await fetchMasters();
  return (
    <Suspense fallback={<div className="py-24 text-center text-muted">Loading…</div>}>
      <SearchClient masters={masters} />
    </Suspense>
  );
}
