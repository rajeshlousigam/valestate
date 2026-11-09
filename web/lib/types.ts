// Shapes returned by the Estara REST API (control.estaraimphal.com/api/web/v1).
// Field names mirror the wire format; see docs/Auth API Docs.docx and
// docs/Property_and_Master_APIs.docx.

export type Id = number;

// ---- Masters ----
export interface State {
  id: Id;
  name: string;
}
export interface District {
  id: Id;
  state_id: Id;
  name: string;
}
export interface City {
  id: Id;
  state_id: Id;
  district_id: Id;
  city_name: string;
}
export type RequestMode = "Enquiry" | "Booking";
export interface RealEstateType {
  id: Id;
  type_name: string;
  real_estate_img?: string;
  request_mode?: string;
}
export interface PropertyTypeOption {
  id: Id;
  real_estate_type_id: Id;
  type_name: string;
}
export interface Budget {
  id: Id;
  real_estate_type_id: Id;
  budget_amount: string;
}
export interface Banner {
  id: Id;
  title: string;
  body: string;
  image: string;
}
export interface HowVerifyStep {
  id: Id;
  how_verify_id: Id;
  icon: string;
  title: string;
  notes: string;
}
export interface HowVerify {
  id: Id;
  header: string;
  short_notes: string;
  types: HowVerifyStep[];
}

export interface Stat {
  id: Id;
  header: string;
  body: string;
}
export interface WhyTrust {
  id: Id;
  header: string;
  short_notes: string;
  types: { id: Id; why_trust_id: Id; icon: string; title: string; short_description: string }[];
}

// ---- Listings ----
export interface ListingSummary {
  id: Id;
  slug: string;
  date_listed: string;
  thumbnail: string;
  real_estate_type: string;
  property_type?: string;
  state_name: string;
  district_name: string;
  city_name: string;
  property_address?: string;
}

export interface Pagination {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface Page<T> {
  data: T[];
  pagination: Pagination;
}

export interface PropertyDetail {
  property: {
    id: Id;
    slug: string;
    date_listed: string;
    real_estate_type: string;
    property_type: string;
    state_name: string;
    district_name: string;
    city_name: string;
    address: string;
    owner_name: string;
    rent_or_cost: string;
    rent_cost_type: string;
    deposit: string;
    title_property: string;
    about_property: string;
    request_mode: string;
  };
  images: { id: Id; property_info_id: Id; prop_img: string }[];
  features: { id: Id; property_info_id: Id; name: string }[];
  time_slots: { id: Id; property_info_id: Id; slot_name: string }[];
}

// ---- Auth / customer ----
export interface AuthUser {
  name: string;
  phone: string;
}

export interface ProfileInput {
  name: string;
  whatsapp_no: string;
  address: string;
  email?: string;
}

// ---- History (GET /masters/myhistory) ----
export interface SiteBookingHistory {
  id: Id;
  booking_code: string;
  title_property: string;
  property_address: string;
  booking_date: string;
  time_slot: string;
  status: string;
}
export interface EnquiryHistory {
  id: Id;
  enquiry_code: string;
  title_property: string;
  property_address: string;
  enquiry_date: string;
}
export interface ListingRequestHistory {
  id: Id;
  real_estate_type: string;
  property_type: string;
  property_address: string;
  property_district: string;
  description: string;
  apply_date: string;
}
export interface History {
  site_booking_history: SiteBookingHistory[];
  property_enquiry_history: EnquiryHistory[];
  property_listing_request_history: ListingRequestHistory[];
}

export interface ListingRequestInput {
  real_estate_type_master_id: Id;
  property_type_master_id: Id;
  property_district_id: Id;
  property_address: string;
  property_description: string;
}

export interface SearchFilters {
  search?: string;
  real_estate_type_id?: Id;
  property_type_id?: Id;
  budget_id?: Id;
  state_id?: Id;
  district_id?: Id;
}
