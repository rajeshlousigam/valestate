"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Native share sheet where available; otherwise WhatsApp + copy link. */
export function ShareButton({ title, className }: { title: string; className?: string }) {
  const [state, setState] = useState<"idle" | "menu" | "copied">("idle");

  async function share() {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
      } catch (e) {
        // AbortError = user closed the sheet; anything else falls back to the menu.
        if (!(e instanceof DOMException && e.name === "AbortError")) setState("menu");
      }
      return;
    }
    setState((s) => (s === "menu" ? "idle" : "menu"));
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState("copied");
      setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("menu");
    }
  }

  return (
    <div className={cn("relative", className)}>
      <button type="button" onClick={() => void share()} className={buttonVariants({ variant: "glass", size: "sm" })}>
        {state === "copied" ? <Check className="h-4 w-4 text-brand" /> : <Share2 className="h-4 w-4" />}
        {state === "copied" ? "Link copied" : "Share"}
      </button>
      {state === "menu" && (
        <div className="glass-panel absolute right-0 top-11 z-20 w-48 rounded-2xl p-1.5">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setState("idle")}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-fg/[0.06]"
          >
            <Share2 className="h-4 w-4 text-brand" /> WhatsApp
          </a>
          <button type="button" onClick={() => void copy()} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-fg/[0.06]">
            <Link2 className="h-4 w-4 text-brand" /> Copy link
          </button>
        </div>
      )}
    </div>
  );
}
