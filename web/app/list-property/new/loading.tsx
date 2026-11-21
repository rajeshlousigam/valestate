import { GlassCard } from "@/components/ui/glass-card";
import { Container } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewListingLoading() {
  return (
    <Container className="py-10" aria-busy="true" aria-label="Loading form">
      <div className="mx-auto mb-8 flex max-w-3xl flex-col items-center gap-3">
        <Skeleton className="h-6 w-40 rounded-full" />
        <Skeleton className="h-9 w-80" />
      </div>
      <GlassCard panel className="mx-auto max-w-3xl space-y-6 p-6 sm:p-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2.5">
            <Skeleton className="h-4 w-28" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28 rounded-full" />
              <Skeleton className="h-9 w-28 rounded-full" />
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          </div>
        ))}
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-12 w-full rounded-full" />
      </GlassCard>
    </Container>
  );
}
