/** On-brand gradient fallbacks shown behind / instead of listing images. */
export const COVERS: string[] = [
  "linear-gradient(135deg, #0f766e 0%, #22d3ee 55%, #6366f1 100%)",
  "linear-gradient(135deg, #7c3aed 0%, #db2777 60%, #f59e0b 100%)",
  "linear-gradient(135deg, #0891b2 0%, #14b8a6 50%, #84cc16 100%)",
  "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
  "linear-gradient(135deg, #be185d 0%, #7c3aed 50%, #2563eb 100%)",
  "linear-gradient(135deg, #059669 0%, #10b981 45%, #0ea5e9 100%)",
  "linear-gradient(135deg, #ea580c 0%, #db2777 100%)",
  "linear-gradient(135deg, #1e3a8a 0%, #0e7490 55%, #14b8a6 100%)",
];

export function cover(index: number): string {
  return COVERS[index % COVERS.length];
}
