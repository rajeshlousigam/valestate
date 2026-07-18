/**
 * Royalty-free listing photos (Unsplash CDN — Unsplash License, free for
 * commercial use). Verified reachable. Rendered with a gradient fallback in
 * <Cover>, so the UI degrades gracefully offline.
 *
 * Indices are grouped so mock data can pick type-appropriate imagery:
 *   0–9  homes & interiors · 10–12 commercial/office · 13–14 land/plots · 15–19 more homes
 */
const IDS = [
  "photo-1512917774080-9991f1c4c750", // 0 white house exterior
  "photo-1570129477492-45c003edd2be", // 1 suburban house
  "photo-1568605114967-8130f3a36994", // 2 modern house
  "photo-1600585154340-be6161a56a0c", // 3 living room
  "photo-1600596542815-ffad4c1539a9", // 4 house exterior
  "photo-1600607687939-ce8a6c25118c", // 5 modern interior
  "photo-1600566753086-00f18fb6b3ea", // 6 bedroom interior
  "photo-1605276374104-dee2a0ed3cd6", // 7 house exterior
  "photo-1512918728675-ed5a9ecdebfd", // 8 apartment interior
  "photo-1493809842364-78817add7ffb", // 9 living room
  "photo-1497366216548-37526070297c", // 10 office space
  "photo-1497366811353-6870744d04b2", // 11 office interior
  "photo-1524758631624-e2822e304c36", // 12 office / meeting
  "photo-1441974231531-c6227db76b6e", // 13 land / trees
  "photo-1500382017468-9049fed747ef", // 14 open land / field
  "photo-1560518883-ce09059eeffa", // 15 house exterior
  "photo-1502005229762-cf1b2da7c5d6", // 16 interior
  "photo-1522708323590-d24dbb6b0267", // 17 living space
  "photo-1586023492125-27b2c045efd7", // 18 bright living room
  "photo-1600210492486-724fe5c67fb0", // 19 modern home
];

export function photo(index: number, w = 800, q = 70): string {
  const id = IDS[((index % IDS.length) + IDS.length) % IDS.length];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}

export const PHOTO_COUNT = IDS.length;
