"use client";

import { CalendarCheck, Check, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Chip } from "@/components/ui/chip";
import { SpecularCTA } from "@/components/ui/specular-cta";
import { ApiError, api } from "@/lib/api";
import type { PropertyDetail } from "@/lib/types";

type State = { kind: "idle" } | { kind: "busy" } | { kind: "done"; msg: string } | { kind: "error"; msg: string };

/** Enquiry (request_mode Enquiry) or today's site-visit booking (request_mode Booking). */
export function PropertyActions({
  propertyId,
  booking,
  slots,
}: {
  propertyId: number;
  booking: boolean;
  slots: PropertyDetail["time_slots"];
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [slotId, setSlotId] = useState<number | null>(null);
  const [state, setState] = useState<State>({ kind: "idle" });

  async function run(fn: () => Promise<string>) {
    if (!user) {
      router.push("/login");
      return;
    }
    setState({ kind: "busy" });
    try {
      setState({ kind: "done", msg: await fn() });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        router.push("/login");
        return;
      }
      setState({ kind: "error", msg: e instanceof Error ? e.message : "Something went wrong." });
    }
  }

  const enquire = () =>
    run(async () => {
      const r = await api.enquire(propertyId);
      return typeof r.msg === "string" ? r.msg : "Enquiry sent.";
    });

  const book = () => {
    if (!slotId) {
      setState({ kind: "error", msg: "Pick a time slot first." });
      return;
    }
    void run(async () => {
      const r = await api.bookSite(propertyId, slotId);
      const code = (r.data as { booking_code?: string } | undefined)?.booking_code;
      return code ? `Site visit booked — code ${code}.` : "Site visit booked.";
    });
  };

  if (state.kind === "done") {
    return (
      <div role="status" className="mt-4 flex items-center gap-2 rounded-2xl bg-brand/10 px-4 py-3 text-sm font-semibold text-brand">
        <Check className="h-4 w-4 shrink-0" /> {state.msg}
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {booking && (
        <div>
          <p className="mb-2 text-sm font-medium">Visit today — pick a slot</p>
          {slots.length ? (
            <div className="flex flex-wrap gap-2">
              {slots.map((s) => (
                <Chip key={s.id} active={slotId === s.id} onClick={() => setSlotId(s.id)}>
                  {s.slot_name}
                </Chip>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No slots available today.</p>
          )}
        </div>
      )}
      {state.kind === "error" && <p role="alert" className="text-sm text-red-500">{state.msg}</p>}
      {booking ? (
        <SpecularCTA size="lg" className="w-full" onClick={book}>
          <CalendarCheck className="h-4 w-4" /> {state.kind === "busy" ? "Booking…" : "Book site visit"}
        </SpecularCTA>
      ) : (
        <SpecularCTA size="lg" className="w-full" onClick={() => void enquire()}>
          <MessageSquare className="h-4 w-4" /> {state.kind === "busy" ? "Sending…" : "Send enquiry"}
        </SpecularCTA>
      )}
      {!user && <p className="text-center text-xs text-muted">You&apos;ll be asked to log in with your phone.</p>}
    </div>
  );
}
