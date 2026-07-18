export type PropertyType = "RESIDENTIAL" | "COMMERCIAL" | "LAND";
export type Intent = "SALE" | "RENT";
export type Furnishing = "UNFURNISHED" | "SEMI" | "FURNISHED";

export interface Locality {
  slug: string;
  name: string;
  area: string; // parent area
  listings: number;
  cover: number; // gradient index
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  type: PropertyType;
  intent: Intent;
  price: number; // INR (sale price or monthly rent)
  deposit?: number; // rent only
  areaSqft: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: Furnishing;
  localitySlug: string;
  localityName: string;
  address: string;
  description: string;
  amenities: string[];
  floor?: string;
  facing?: string;
  parking?: number;
  ageYears?: number;
  ownerName: string;
  verifiedAt: string; // ISO date
  verifiedChecks: string[];
  postedAt: string; // ISO date
  featured?: boolean;
  cover: number; // gradient cover index 0..7
  gallery: number[]; // gradient indices
}
