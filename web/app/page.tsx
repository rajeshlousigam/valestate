const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/v1";

async function getApiHealth(): Promise<{ status: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    if (!res.ok) return { status: "degraded" };
    return (await res.json()) as { status: string };
  } catch {
    return null;
  }
}

export default async function Home() {
  const health = await getApiHealth();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <span className="inline-flex items-center gap-2 rounded-full bg-trust/10 px-3 py-1 text-sm font-medium text-trust">
        ✓ Verified before public
      </span>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">HousePoint</h1>
      <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
        Verified real-estate marketplace for <strong>Imphal, Manipur</strong>.
        Every listing is checked by our operations team before it goes public —
        no fakes, no duplicates, no brokers.
      </p>

      <div className="mt-10 rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
        <p className="font-semibold">Phase 0 — Foundations</p>
        <p className="mt-1 text-gray-500">
          API status:{" "}
          {health === null ? (
            <span className="text-red-500">unreachable (start the backend)</span>
          ) : (
            <span className="text-trust">{health.status}</span>
          )}
        </p>
      </div>
    </main>
  );
}
