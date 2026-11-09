/**
 * Estara REST API client. Envelope is { status: "success" | "fail", msg, ... }.
 * Real failures carry proper HTTP codes (400/401/404/409/422/429); an empty
 * result set is HTTP 200 + status "fail", so list reads map that to [] while
 * actions treat any "fail" as an error. The customer token is a long-lived
 * bearer (no refresh endpoint) kept in localStorage. Public reads are safe to
 * call from server components (ISR via `next.revalidate`).
 */
import type {
  AuthUser,
  Banner,
  City,
  District,
  History,
  HowVerify,
  Id,
  ListingRequestInput,
  ListingSummary,
  Page,
  ProfileInput,
  PropertyDetail,
  PropertyTypeOption,
  Budget,
  RealEstateType,
  SearchFilters,
  Stat,
  State,
  WhyTrust,
} from "./types";

const API_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://control.estaraimphal.com/api/web/v1").replace(/\/$/, "");
// Browsers go through the same-origin rewrite in next.config.mjs (the API
// rejects CORS preflight); server components call the API directly.
const BASE = typeof window === "undefined" ? API_URL : "/estara-api";
const ASSETS = (process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "https://control.estaraimphal.com/docs").replace(/\/$/, "");

const TOKEN_KEY = "es_token";
const USER_KEY = "es_user";
const DEVICE_KEY = "es_device_id";

export type AssetKind = "property" | "banner" | "realestate" | "landing";
export const assetUrl = (kind: AssetKind, file?: string | null): string | undefined =>
  file ? `${ASSETS}/${kind}/${encodeURIComponent(file)}` : undefined;

// ---- session (browser only) ----
const hasStorage = () => typeof window !== "undefined" && !!window.localStorage;
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

const getToken = () => (hasStorage() ? localStorage.getItem(TOKEN_KEY) : null);

export function loadSession(): AuthUser | null {
  if (!hasStorage()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!getToken() || !raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveSession(t: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, t);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function saveUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (!hasStorage()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function deviceId(): string {
  const existing = localStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const id = `web-${crypto.randomUUID()}`;
  localStorage.setItem(DEVICE_KEY, id);
  return id;
}

// ---- transport ----
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Envelope = { status?: string; msg?: unknown; [k: string]: unknown };

const FRIENDLY: Record<number, string> = {
  401: "Please log in again.",
  429: "Too many requests. Please wait a minute and try again.",
};

const REVALIDATE_S = 300;

async function send(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<Envelope> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (init.auth) {
    const token = getToken();
    if (!token) throw new ApiError(FRIENDLY[401], 401);
    headers.set("Authorization", `Bearer ${token}`);
  }
  // Public GETs are cacheable on the server; authed/mutating calls never are.
  const cache: RequestInit =
    !init.auth && (!init.method || init.method === "GET")
      ? { next: { revalidate: REVALIDATE_S } }
      : { cache: "no-store" };

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...cache, ...init, headers });
  } catch {
    throw new ApiError("Network error. Check your connection.", 0);
  }

  const text = await res.text();
  let body: Envelope = {};
  try {
    body = text ? (JSON.parse(text) as Envelope) : {};
  } catch {
    throw new ApiError(`Unexpected server response (HTTP ${res.status}).`, res.status);
  }

  if (!res.ok) {
    if (res.status === 401 && init.auth) {
      clearSession();
      onUnauthorized?.();
    }
    const msg = typeof body.msg === "string" ? body.msg : FRIENDLY[res.status] ?? `HTTP ${res.status}`;
    throw new ApiError(msg, res.status);
  }
  return body;
}

/** Action endpoints: any status other than "success" is an error. */
async function action(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<Envelope> {
  const body = await send(path, init);
  if (body.status !== "success") {
    throw new ApiError(typeof body.msg === "string" ? body.msg : "Request failed.", 200);
  }
  return body;
}

/** Master lists: payload is in `msg`; "fail" means no records. */
async function list<T>(path: string): Promise<T[]> {
  const body = await send(path);
  return body.status === "success" && Array.isArray(body.msg) ? (body.msg as T[]) : [];
}

const EMPTY_PAGE: Page<never>["pagination"] = { currentPage: 1, perPage: 20, total: 0, totalPages: 0, hasMore: false };

/** Paginated lists: payload is in `data` + `pagination`. */
async function page<T>(path: string, init?: RequestInit): Promise<Page<T>> {
  const body = await send(path, init);
  const data = body.status === "success" && Array.isArray(body.data) ? (body.data as T[]) : [];
  const pagination = (body.pagination as Page<T>["pagination"] | undefined) ?? EMPTY_PAGE;
  return { data, pagination };
}

const post = (b: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(b) });

// ---- endpoints ----
export const api = {
  // Auth
  requestSignupOtp: (phone: string) => action("/logins/otpsignup", post({ phone })),
  verifySignupOtp: async (phone: string, otp: string): Promise<string> => {
    const b = await action("/logins/verifysignupotp", post({ phone, otp }));
    if (typeof b.signup_token !== "string") throw new ApiError("Signup token missing from response.", 200);
    return b.signup_token;
  },
  createCustomer: (phone: string, signupToken: string, p: ProfileInput) =>
    action(
      "/logins/createcustomerinfo",
      post({ phone, signup_token: signupToken, ...p, device_id: deviceId() }),
    ),
  requestLoginOtp: (phone: string) => action("/logins/otplogin", post({ phone })),
  verifyLoginOtp: async (phone: string, otp: string): Promise<{ token: string; user: AuthUser }> => {
    const b = await action("/logins/verifyloginotp", post({ phone, otp, device: deviceId() }));
    const info = Array.isArray(b.info) ? (b.info[0] as Record<string, unknown> | undefined) : undefined;
    if (!info || typeof info.token !== "string") throw new ApiError("Login token missing from response.", 200);
    return {
      token: info.token,
      user: { name: String(info.name ?? ""), phone: String(info.phone ?? phone) },
    };
  },
  updateProfile: (p: ProfileInput) =>
    action("/logins/updatecustomerinfo", { ...post({ ...p, device_id: deviceId() }), auth: true }),
  requestPhoneChange: (newPhone: string) =>
    action("/logins/requestphonechange", { ...post({ new_phone: newPhone }), auth: true }),
  verifyPhoneChange: (newPhone: string, otp: string) =>
    action("/logins/verifyphonechange", { ...post({ new_phone: newPhone, otp }), auth: true }),

  // Masters
  states: () => list<State>("/masters/sendstate"),
  districts: () => list<District>("/masters/senddistrict"),
  cities: () => list<City>("/masters/sendcity"),
  realEstateTypes: () => list<RealEstateType>("/masters/realestateall"),
  propertyTypes: () => list<PropertyTypeOption>("/masters/propertytypedropdown"),
  budgets: () => list<Budget>("/masters/budgetdropdown"),
  banners: () => list<Banner>("/masters/banners"),
  howVerify: () => list<HowVerify>("/masters/howverify"),
  stats: () => list<Stat>("/masters/sendstat"),
  whyTrust: () => list<WhyTrust>("/masters/whytrust"),

  // Listings
  latestEnquiry: () => list<ListingSummary>("/masters/proplist"),
  latestBooking: () => list<ListingSummary>("/masters/spotlist"),
  allEnquiry: (p: number) => page<ListingSummary>(`/masters/proplistviewall?page=${p}`),
  allBooking: (p: number) => page<ListingSummary>(`/masters/spotlistviewall?page=${p}`),
  search: (search: string, p: number) => page<ListingSummary>("/masters/searchprop", post({ search, page: p })),
  filter: (f: SearchFilters, p: number) =>
    page<ListingSummary>(
      "/masters/filterprop",
      post({
        real_estate_type_id: f.real_estate_type_id ?? 0,
        property_type_id: f.property_type_id ?? 0,
        budget_id: f.budget_id ?? 0,
        state_id: f.state_id ?? 0,
        district_id: f.district_id ?? 0,
        page: p,
      }),
    ),
  detail: async (slug: string): Promise<PropertyDetail | null> => {
    try {
      const b = await send(`/masters/viewdetails?slug=${encodeURIComponent(slug)}`);
      return b.status === "success" ? (b.data as PropertyDetail) : null;
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  // Customer actions
  enquire: (propertyId: Id) =>
    action("/masters/propertyenquiry", { ...post({ property_info_id: propertyId }), auth: true }),
  bookSite: (propertyId: Id, timeSlotId: Id) =>
    action("/masters/sitebooking", { ...post({ property_id: propertyId, time_slot_id: timeSlotId }), auth: true }),
  requestListing: (b: ListingRequestInput) =>
    action("/masters/propertylistingrequest", { ...post(b), auth: true }),
  history: async (): Promise<History> => {
    const b = await send("/masters/myhistory", { auth: true });
    const d = (b.status === "success" ? b.data : null) as Partial<History> | null;
    return {
      site_booking_history: d?.site_booking_history ?? [],
      property_enquiry_history: d?.property_enquiry_history ?? [],
      property_listing_request_history: d?.property_listing_request_history ?? [],
    };
  },
};

/** All dropdown masters in one go; a failed list degrades to empty, not a crash. */
export async function fetchMasters() {
  const settle = <T,>(p: Promise<T[]>) => p.catch((): T[] => []);
  const [realEstateTypes, propertyTypes, budgets, states, districts] = await Promise.all([
    settle(api.realEstateTypes()),
    settle(api.propertyTypes()),
    settle(api.budgets()),
    settle(api.states()),
    settle(api.districts()),
  ]);
  return { realEstateTypes, propertyTypes, budgets, states, districts };
}

export const isBookingMode = (mode?: string) => mode?.toLowerCase() === "booking";
export const PHONE_RE = /^\d{10}$/;
