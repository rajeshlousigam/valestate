"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusPill } from "@/components/account/status-pill";
import { GlassCard } from "@/components/ui/glass-card";
import { USE_API, api } from "@/lib/api";
import { relativeDate } from "@/lib/format";

type Inq = { id: number; status: string; message?: string; created_at: string; slug: string; title: string };

const MOCK: Inq[] = [
  { id: 1, status: "RESPONDED", message: "Is this still available?", created_at: "2026-07-16", slug: "3bhk-apartment-thangmeiband-sale", title: "3 BHK Apartment, Thangmeiband" },
  { id: 2, status: "NEW", message: "Can I schedule a visit?", created_at: "2026-07-18", slug: "2bhk-flat-uripok-rent", title: "2 BHK Flat, Uripok" },
];

export default function MyInquiries() {
  const [rows, setRows] = useState<Inq[] | null>(null);
  useEffect(() => {
    (async () => {
      if (!USE_API) return setRows(MOCK);
      try {
        setRows((await api.myInquiries()).data);
      } catch {
        setRows([]);
      }
    })();
  }, []);

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold">My inquiries</h2>
      {rows === null ? (
        <p className="text-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <GlassCard className="p-12 text-center text-muted">
          You haven&apos;t contacted any owners yet. <Link href="/search" className="font-semibold text-brand">Browse listings →</Link>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {rows.map((i) => (
            <GlassCard key={i.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <Link href={`/property/${i.slug}`} className="font-semibold hover:text-brand">{i.title}</Link>
                <div className="text-right">
                  <StatusPill status={i.status} />
                  <p className="mt-1 text-xs text-subtle">{relativeDate(i.created_at)}</p>
                </div>
              </div>
              {i.message && <p className="mt-3 rounded-2xl bg-fg/[0.04] p-3 text-sm text-fg/80">“{i.message}”</p>}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
