/**
 * Manipuri / ancient-Indian architectural motifs as stroke-only SVG groups.
 * Every motif stands on a baseline at y=38 and inherits stroke from its parent
 * <svg>, so they compose into skylines and scale for background art.
 *  · Yumjao      — traditional Meitei house: steep gable + crossed "chirong" finials (56 wide)
 *  · KanglaGate  — arched gateway under a pitched, chirong-crowned roof (48 wide)
 *  · TwinDome    — two onion domes with finials, à la Shree Govindajee (40 wide)
 *  · Shikhara    — curvilinear temple tower with amalaka + kalasha (32 wide)
 */
type MotifProps = { x?: number; y?: number; scale?: number };

const at = ({ x = 0, y = 0, scale = 1 }: MotifProps) => `translate(${x} ${y}) scale(${scale})`;

export function Yumjao(p: MotifProps) {
  return (
    <g transform={at(p)}>
      <path d="M8 38 V32 H1 L28 7 L55 32 H48 V38" />
      {/* chirong: crossed, horn-like rafter ends rising above the ridge */}
      <path d="M18 17 Q25 6 38 -4 M38 17 Q31 6 18 -4" />
      <path d="M24 38 V30 H32 V38" />
    </g>
  );
}

export function KanglaGate(p: MotifProps) {
  return (
    <g transform={at(p)}>
      <path d="M3 38 V20 H45 V38" />
      <path d="M14 38 V30 A10 10 0 0 1 34 30 V38" />
      <path d="M0 20 L24 9 L48 20" />
      <path d="M17 14 Q22 5 31 -1 M31 14 Q26 5 17 -1" />
    </g>
  );
}

export function TwinDome(p: MotifProps) {
  return (
    <g transform={at(p)}>
      <path d="M2 38 V26 H38 V38" />
      <path d="M4 26 C4 19 10 19 10 14 C10 19 16 19 16 26 M10 14 V9" />
      <path d="M24 26 C24 19 30 19 30 14 C30 19 36 19 36 26 M30 14 V9" />
      <path d="M17 38 V32 A3 3 0 0 1 23 32 V38" />
    </g>
  );
}

export function Shikhara(p: MotifProps) {
  return (
    <g transform={at(p)}>
      <path d="M2 38 V30 H6 V26 C7 17 11 10 16 5 C21 10 25 17 26 26 V30 H30 V38" />
      <path d="M11 26 C12 19 14 13 16 8 M21 26 C20 19 18 13 16 8" />
      <path d="M13 4 H19 M16 4 V0" />
    </g>
  );
}

/** One 600×40 skyline run of the motifs on a shared ground line. */
export function ManipuriSkyline() {
  return (
    <>
      <path d="M0 38 H600" />
      <Yumjao x={0} />
      <Shikhara x={70} />
      <TwinDome x={116} />
      <Yumjao x={170} />
      <KanglaGate x={240} />
      <Shikhara x={302} />
      <Yumjao x={348} />
      <TwinDome x={418} />
      <Shikhara x={472} />
      <KanglaGate x={520} />
    </>
  );
}
