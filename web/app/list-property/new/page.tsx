import type { Metadata } from "next";
import { ListingWizard } from "@/components/property/listing-wizard";
import { Container, Eyebrow } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "List your property",
  description: "Add your property to ValEstate — verified before it goes public.",
  robots: { index: false, follow: false }, // owner flow, not for indexing
};

export default function NewListingPage() {
  return (
    <Container className="py-10">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <Eyebrow>List your property · Free at launch</Eyebrow>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          A few steps to a <span className="brand-text">verified</span> listing
        </h1>
      </div>
      <ListingWizard />
    </Container>
  );
}
