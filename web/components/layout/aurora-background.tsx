/** Ambient animated aurora behind the frosted-glass UI (docs/16 liquid-glass theme). */
export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-bg" />
      {/* colored light blobs */}
      <div className="absolute -left-[10%] -top-[15%] h-[55vmax] w-[55vmax] rounded-full bg-aurora1/40 blur-[120px] animate-aurora-1" />
      <div className="absolute -right-[12%] top-[8%] h-[50vmax] w-[50vmax] rounded-full bg-aurora2/35 blur-[130px] animate-aurora-2" />
      <div className="absolute bottom-[-18%] left-[25%] h-[48vmax] w-[48vmax] rounded-full bg-aurora3/30 blur-[130px] animate-aurora-3" />
      {/* faint grid for depth */}
      <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:56px_56px]" />
      {/* top + bottom fade */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg to-transparent" />
    </div>
  );
}
