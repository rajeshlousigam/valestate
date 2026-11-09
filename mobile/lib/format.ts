// Indian numbering (₹, lakh/crore) + helpers for Estara API string fields.
export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${trim(cr)} Cr`;
  }
  if (amount >= 100000) {
    const l = amount / 100000;
    return `₹${trim(l)} L`;
  }
  if (amount >= 1000) {
    return `₹${trim(amount / 1000)}K`;
  }
  return `₹${amount}`;
}

function trim(n: number): string {
  // 4.5 → "4.5", 4.25 → "4.25", 4 → "4"
  return String(Number(n.toFixed(2)));
}

export function relativeDate(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/** API amounts arrive as strings ("4500.00"); empty/non-numeric → null. */
export function costLabel(amount: string | undefined, type?: string): string | null {
  const n = Number(amount);
  if (!amount || !Number.isFinite(n) || n <= 0) return null;
  return type ? `${formatINR(n)} · ${type}` : formatINR(n);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Master values use "NA" as a placeholder; hide those. */
export const present = (v?: string | null): v is string => !!v && v.trim() !== "" && v.trim().toUpperCase() !== "NA";
