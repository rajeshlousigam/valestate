import Link from "next/link";
import { cn } from "@/lib/utils";

/** Estara Properties mark: the gold house/towers from the brand logo on its black tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-black ring-1 ring-accent/30", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/estara-mark.png" alt="" className="h-[78%] w-[78%] object-contain" />
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Estara Properties — home" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="transition-transform group-hover:scale-105">
        <LogoMark />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-lg font-bold tracking-wide text-accent">ESTARA</span>
        <span className="mt-0.5 text-[9px] font-semibold tracking-[0.32em] text-fg/70">PROPERTIES</span>
      </span>
    </Link>
  );
}
