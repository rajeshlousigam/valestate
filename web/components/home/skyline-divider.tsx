import { ManipuriSkyline } from "@/components/art/manipuri";
import { LogoMark } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

// Gold line-art skyline of Manipuri / ancient-Indian forms (Yumjao houses with
// chirong finials, Kangla gate, twin-domed temple, shikhara). Right half mirrored.
function Skyline({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <svg
      viewBox="0 -6 600 46"
      preserveAspectRatio={mirrored ? "xMinYMax slice" : "xMaxYMax slice"}
      className={cn("h-9 w-full text-accent sm:h-12", mirrored && "-scale-x-100")}
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" opacity="0.6">
        <ManipuriSkyline />
      </g>
    </svg>
  );
}

/** Signature divider under the hero banner: skyline on both sides of the logo mark. */
export function SkylineDivider({ className }: { className?: string }) {
  return (
    <div className={cn("relative z-10 flex items-end gap-3 overflow-hidden px-4 sm:gap-5", className)} aria-hidden>
      <div className="min-w-0 flex-1">
        <Skyline />
      </div>
      <span className="grid shrink-0 place-items-center rounded-full bg-bg p-1 ring-1 ring-accent/40">
        <LogoMark className="h-9 w-9 rounded-full sm:h-10 sm:w-10" />
      </span>
      <div className="min-w-0 flex-1">
        <Skyline mirrored />
      </div>
    </div>
  );
}
