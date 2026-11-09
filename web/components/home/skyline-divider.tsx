import { ManipuriSkyline } from "@/components/art/manipuri";
import { LogoMark } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

// Gold line-art skyline of Manipuri / ancient-Indian forms (Yumjao houses with
// chirong finials, Kangla gate, twin-domed temple, shikhara). Right half mirrored.
// Fixed scale (height-driven, never cropped); three runs so it always fills
// half the viewport, and the overflow is clipped by the wrapper.
function Skyline({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <svg
      viewBox="0 -6 1800 46"
      className={cn("h-5 w-auto max-w-none shrink-0 text-accent sm:h-7", mirrored && "-scale-x-100")}
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" opacity="0.6">
        {[0, 600, 1200].map((x) => (
          <g key={x} transform={`translate(${x} 0)`}>
            <ManipuriSkyline />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Signature divider under the hero banner: skyline on both sides of the logo mark. */
export function SkylineDivider({ className }: { className?: string }) {
  return (
    <div className={cn("relative z-10 flex items-end gap-2 overflow-hidden px-4 sm:gap-3", className)} aria-hidden>
      <div className="flex min-w-0 flex-1 justify-end overflow-hidden">
        <Skyline />
      </div>
      <span className="grid shrink-0 place-items-center rounded-full bg-bg p-0.5 ring-1 ring-accent/40">
        <LogoMark className="h-6 w-6 rounded-full sm:h-7 sm:w-7" />
      </span>
      <div className="flex min-w-0 flex-1 justify-start overflow-hidden">
        <Skyline mirrored />
      </div>
    </div>
  );
}
