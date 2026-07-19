"use client";

import { Check, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { buttonVariants } from "@/components/ui/button";
import { SpecularCTA } from "@/components/ui/specular-cta";
import { USE_API, api } from "@/lib/api";
import { cn } from "@/lib/utils";

export function InquiryButton({ slug }: { slug: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function start() {
    if (!user) {
      router.push("/login");
      return;
    }
    setOpen(true);
  }

  async function send() {
    setState("sending");
    setError(null);
    try {
      if (USE_API) await api.createInquiry(slug, message);
      setState("sent");
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Could not send");
    }
  }

  if (state === "sent") {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-brand/10 px-4 py-3 text-sm font-semibold text-brand">
        <Check className="h-4 w-4" /> Inquiry sent — the owner will be in touch.
      </div>
    );
  }

  if (!open) {
    return (
      <SpecularCTA size="lg" className="mt-4 w-full" onClick={start}>
        <MessageSquare className="h-4 w-4" /> Contact owner
      </SpecularCTA>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Hi, is this still available? I'd like to visit."
        className="glass-input w-full rounded-2xl bg-transparent p-3 text-sm outline-none placeholder:text-subtle"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button onClick={send} disabled={state === "sending"} className={cn(buttonVariants({ variant: "primary", size: "md" }), "flex-1")}>
          {state === "sending" ? "Sending…" : "Send inquiry"}
        </button>
        <button onClick={() => setOpen(false)} className={buttonVariants({ variant: "glass", size: "md" })}>Cancel</button>
      </div>
    </div>
  );
}
