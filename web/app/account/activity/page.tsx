"use client";

import { CalendarCheck, MessageSquare } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { formatDate } from "@/lib/format";
import { useHistory } from "@/lib/use-history";
import { cn } from "@/lib/utils";

export default function Activity() {
  const { data, error, loading, reload } = useHistory();

  if (loading) return <p className="text-muted">Loading…</p>;
  if (error || !data) {
    return (
      <GlassCard className="p-12 text-center">
        <p className="font-semibold">Couldn&apos;t load your activity</p>
        <p className="mt-1 text-sm text-muted">{error}</p>
        <button onClick={reload} className="mt-4 text-sm font-semibold text-brand hover:underline">Try again</button>
      </GlassCard>
    );
  }

  const bookings = data.site_booking_history;
  const enquiries = data.property_enquiry_history;

  if (!bookings.length && !enquiries.length) {
    return (
      <GlassCard className="p-12 text-center text-muted">
        No enquiries or site visits yet. <Link href="/search" className="font-semibold text-brand">Browse listings →</Link>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-10">
      {bookings.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><CalendarCheck className="h-5 w-5 text-brand" /> Site visits</h2>
          <div className="space-y-3">
            {bookings.map((b) => (
              <GlassCard key={b.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{b.title_property}</p>
                    <p className="mt-0.5 text-sm text-muted">{b.property_address}</p>
                    <p className="mt-1 text-xs text-subtle">{b.booking_code} · {formatDate(b.booking_date)} · {b.time_slot}</p>
                  </div>
                  <span
                    className={cn(
                      "inline-block shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                      /cancel|reject/i.test(b.status) ? "bg-red-500/15 text-red-600 dark:text-red-400" : "bg-brand/15 text-brand",
                    )}
                  >
                    {b.status}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      )}
      {enquiries.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><MessageSquare className="h-5 w-5 text-brand" /> Enquiries</h2>
          <div className="space-y-3">
            {enquiries.map((e) => (
              <GlassCard key={e.id} className="p-5">
                <p className="truncate font-semibold">{e.title_property}</p>
                <p className="mt-0.5 text-sm text-muted">{e.property_address}</p>
                <p className="mt-1 text-xs text-subtle">{e.enquiry_code} · {formatDate(e.enquiry_date)}</p>
              </GlassCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
