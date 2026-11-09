import { KanglaGate, Shikhara, Yumjao } from "@/components/art/manipuri";
import { cn } from "@/lib/utils";

/**
 * Very faint line drawings fixed behind the page: Manipuri / ancient-Indian
 * architecture (Yumjao house, shikhara temple, Kangla gate) plus real-estate
 * touches (key, floor plan). Decorative only: aria-hidden, no pointer events,
 * ~5% opacity, and fewer pieces on small screens.
 */
export function EstateArt() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden text-fg opacity-[0.05] dark:opacity-[0.06]">
      <Art className="-left-6 bottom-[6%] w-60 sm:w-80" viewBox="0 -6 56 45">
        <Yumjao />
      </Art>

      <Art className="-right-6 top-[12%] hidden w-40 md:block" viewBox="0 -1 32 40">
        <Shikhara />
      </Art>

      <Art className="right-[22%] top-[52%] hidden w-44 xl:block" viewBox="0 -3 48 42">
        <KanglaGate />
      </Art>

      <Art className="right-[6%] bottom-[6%] hidden w-40 lg:block" viewBox="0 0 120 70">
        {/* key */}
        <circle cx="26" cy="35" r="18" />
        <circle cx="26" cy="35" r="7" />
        <path d="M44 35 H112 M92 35 V50 M104 35 V46" />
      </Art>

      <Art className="left-[4%] top-[38%] hidden w-24 lg:block" viewBox="0 0 60 80">
        {/* map pin with a Yumjao house */}
        <path d="M30 76 C30 76 6 46 6 30 A24 24 0 0 1 54 30 C54 46 30 76 30 76 Z" />
        <Yumjao x={19} y={14} scale={0.4} />
      </Art>

      <Art className="left-[42%] -bottom-6 hidden w-64 xl:block" viewBox="0 0 160 90">
        {/* floor plan */}
        <rect x="6" y="6" width="148" height="78" />
        <path d="M70 6 V50 M70 64 V84 M6 46 H40 M54 46 H70 M110 6 V36 M110 50 V84 M110 50 H154" />
        <path d="M40 46 A14 14 0 0 1 54 46" />
      </Art>
    </div>
  );
}

function Art({ className, viewBox, children }: { className: string; viewBox: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      className={cn("absolute [&_*]:[vector-effect:non-scaling-stroke]", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {children}
    </svg>
  );
}
