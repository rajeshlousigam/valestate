"use client";

import { Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusPill } from "@/components/account/status-pill";
import { GlassCard } from "@/components/ui/glass-card";
import { USE_API, api } from "@/lib/api";
import { relativeDate } from "@/lib/format";

type Lead = { id: number; status: string; message?: string; created_at: string; slug: string; title: string; buyerName: string; buyerPhone?: string };

const MOCK: Lead[] = [
  { id: 1, status: "NEW", message: "Is this still available? Can I visit this weekend?", created_at: "2026-07-17", slug: "3bhk-apartment-thangmeiband-sale", title: "3 BHK Apartment, Thangmeiband", buyerName: "Priya D.", buyerPhone: "98765 43210" },
  { id: 2, status: "RESPONDED", message: "What's the deposit?", created_at: "2026-07-15", slug: "2bhk-flat-uripok-rent", title: "2 BHK Flat, Uripok", buyerName: "Sanjoy K.", buyerPhone: "98765 11223" },
];

export default function Leads() {
  const [rows, setRows] = useState<Lead[] | null>(null);
  useEffect(() => {
    (async () => {
      if (!USE_API) return setRows(MOCK);
      try {
        setRows((await api.receivedInquiries()).data);
      } catch {
        setRows([]);
      }
    })();
  }, []);

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold">Leads</h2>
      {rows === null ? (
        <p className="text-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <GlassCard className="p-12 text-center text-muted">No inquiries yet. Verified listings attract genuine buyers.</GlassCard>
      ) : (
        <div className="space-y-3">
          {rows.map((l) => (
            <GlassCard key={l.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{l.buyerName}</p>
                  <Link href={`/property/${l.slug}`} className="text-sm text-muted hover:text-brand">{l.title}</Link>
                </div>
                <div className="text-right">
                  <StatusPill status={l.status} />
                  <p className="mt-1 text-xs text-subtle">{relativeDate(l.created_at)}</p>
                </div>
              </div>
              {l.message && <p className="mt-3 rounded-2xl bg-fg/[0.04] p-3 text-sm text-fg/80">“{l.message}”</p>}
              {l.buyerPhone && (
                <a href={`tel:${l.buyerPhone}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                  <Phone className="h-4 w-4" /> {l.buyerPhone}
                </a>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
