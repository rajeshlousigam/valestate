import { NextResponse, type NextRequest } from "next/server";
import { ApiError, api } from "@/lib/api";
import type { ListingSummary, Page, SearchFilters } from "@/lib/types";

/**
 * GET /api/listings — cached read-through for listing search/filters.
 * The Estara API rate-limits (429) and runs out of DB connections (500) under
 * bursts, so: identical queries are cached at the Vercel edge for 60s, and a
 * transient upstream failure is retried once. Failures are never cached.
 *
 * Query: search? | type, ptype, budget, state, district (ids) · page (1–100).
 * Structured filters take precedence over text search (the API can't combine them).
 */
const CACHE_OK = "public, s-maxage=60, stale-while-revalidate=300";
const RETRY_DELAY_MS = 400;

const id = (v: string | null): number | undefined => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 && n < 1_000_000 ? n : undefined;
};

const transient = (e: unknown) => e instanceof ApiError && (e.status === 0 || e.status === 429 || e.status >= 500);

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (!transient(e)) throw e;
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    return fn();
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const page = id(q.get("page")) ?? 1;
  if (page > 100) return NextResponse.json({ msg: "page out of range" }, { status: 400 });
  const search = (q.get("search") ?? "").trim().slice(0, 100);
  const f: SearchFilters = {
    real_estate_type_id: id(q.get("type")),
    property_type_id: id(q.get("ptype")),
    budget_id: id(q.get("budget")),
    state_id: id(q.get("state")),
    district_id: id(q.get("district")),
  };
  const filtered = Object.values(f).some(Boolean);

  try {
    const result: Page<ListingSummary> = await withRetry(() => (filtered ? api.filter(f, page) : api.search(search, page)));
    return NextResponse.json(result, { headers: { "Cache-Control": CACHE_OK } });
  } catch (e) {
    const status = e instanceof ApiError && e.status >= 400 ? e.status : 502;
    const msg =
      status === 429
        ? "Search is busy right now. Please try again in a moment."
        : status >= 500
          ? "Search is temporarily unavailable. Please try again."
          : e instanceof Error
            ? e.message
            : "Search failed.";
    return NextResponse.json({ msg }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
