/** Indian numbering: ₹, lakh/crore. ValEstate launch city = Imphal (docs/24). */
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

/** Rent shown as ₹X,XXX/mo with Indian grouping. */
export function formatRent(amount: number): string {
  return `${groupINR(amount)}/mo`;
}

export function groupINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

function trim(n: number): string {
  return n.toFixed(n % 1 === 0 ? 0 : 2).replace(/\.00$/, "");
}

export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString("en-IN")} sqft`;
}

export function relativeDate(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
