import { Container } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";

/** Site-wide fallback: any route without its own loading state shows this instantly. */
export default function Loading() {
  return (
    <Container className="py-10" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-64 rounded-4xl" />
        ))}
      </div>
    </Container>
  );
}
