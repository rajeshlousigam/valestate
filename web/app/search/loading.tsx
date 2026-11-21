import { GlassCard } from "@/components/ui/glass-card";
import { Container } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <Container className="pt-8" aria-busy="true" aria-label="Loading search">
      <Skeleton className="h-16 w-full rounded-4xl" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        <GlassCard className="hidden space-y-4 p-6 lg:block">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full rounded-full" />
            </div>
          ))}
        </GlassCard>
        <div>
          <Skeleton className="mb-5 h-6 w-52" />
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="glass overflow-hidden rounded-4xl">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="space-y-2.5 p-5">
                  <Skeleton className="h-4 w-3/4 rounded-full" />
                  <Skeleton className="h-3 w-1/2 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
