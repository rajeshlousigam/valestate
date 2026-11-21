import { GlassCard } from "@/components/ui/glass-card";
import { Container } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";

/** Shown instantly while a property page loads (mirrors its layout). */
export default function PropertyLoading() {
  return (
    <Container className="pt-8" aria-busy="true" aria-label="Loading property">
      <Skeleton className="h-5 w-32" />
      <div className="mt-5 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Skeleton className="aspect-[16/10] w-full rounded-4xl" />
          <div className="mt-3 flex gap-3">
            <Skeleton className="h-16 w-24 sm:h-20 sm:w-28" />
            <Skeleton className="h-16 w-24 sm:h-20 sm:w-28" />
            <Skeleton className="h-16 w-24 sm:h-20 sm:w-28" />
          </div>
          <Skeleton className="mt-6 h-6 w-40 rounded-full" />
          <Skeleton className="mt-3 h-8 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />
          <GlassCard className="mt-6 grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 sm:p-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </GlassCard>
          <Skeleton className="mt-8 h-6 w-48" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
        </div>
        <div className="space-y-5">
          <GlassCard panel className="space-y-3 p-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-12 w-full rounded-full" />
          </GlassCard>
          <GlassCard className="space-y-3 p-6">
            <Skeleton className="h-11 w-11" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </GlassCard>
        </div>
      </div>
    </Container>
  );
}
