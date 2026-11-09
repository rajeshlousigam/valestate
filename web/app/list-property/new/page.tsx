import type { Metadata } from "next";
import { ListingRequestForm } from "@/components/property/listing-request-form";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { fetchMasters } from "@/lib/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "List your property",
  description: "Request a listing on Estara Properties — verified before it goes public.",
  robots: { index: false, follow: false }, // owner flow, not for indexing
};

export default async function NewListingPage() {
  const masters = await fetchMasters();
  return (
    <Container className="py-10">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <Eyebrow>List your property</Eyebrow>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Tell us about your <span className="brand-text">property</span>
        </h1>
        <p className="mt-3 text-muted">Our verification team will contact you before it goes public.</p>
      </div>
      <ListingRequestForm masters={masters} />
    </Container>
  );
}
