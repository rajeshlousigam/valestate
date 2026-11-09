/**
 * Estara REST API client. Envelope is { status: "success" | "fail", msg, ... }.
 * Real failures carry proper HTTP codes (400/401/404/409/422/429); an empty
 * result set is HTTP 200 + status "fail", so list reads map that to [] while
 * actions treat any "fail" as an error. The customer token is a long-lived
 * bearer (no refresh endpoint) kept in expo-secure-store.
 */
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
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
  State,
} from "./types";

const BASE = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://control.estaraimphal.com/api/web/v1").replace(/\/$/, "");
const ASSETS = (process.env.EXPO_PUBLIC_ASSET_BASE_URL ?? "https://control.estaraimphal.com/docs").replace(/\/$/, "");

const TOKEN_KEY = "es_token";
const USER_KEY = "es_user";
const DEVICE_KEY = "es_device_id";

export type AssetKind = "property" | "banner" | "realestate" | "landing";
export const assetUrl = (kind: AssetKind, file?: string | null): string | undefined =>
  file ? `${ASSETS}/${kind}/${encodeURIComponent(file)}` : undefined;

// ---- session ----
let token: string | null = null;
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

export async function loadSession(): Promise<AuthUser | null> {
  token = await SecureStore.getItemAsync(TOKEN_KEY);
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!token || !raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function saveSession(t: string, user: AuthUser): Promise<void> {
  token = t;
  await SecureStore.setItemAsync(TOKEN_KEY, t);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function saveUser(user: AuthUser): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function clearSession(): Promise<void> {
  token = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

async function deviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_KEY);
  if (existing) return existing;
  const id = `${Platform.OS}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  await SecureStore.setItemAsync(DEVICE_KEY, id);
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

async function send(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<Envelope> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (init.auth) {
    if (!token) throw new ApiError(FRIENDLY[401], 401);
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers });
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
      await clearSession();
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
  createCustomer: async (phone: string, signupToken: string, p: ProfileInput) =>
    action(
      "/logins/createcustomerinfo",
      post({ phone, signup_token: signupToken, ...p, device_id: await deviceId() }),
    ),
  requestLoginOtp: (phone: string) => action("/logins/otplogin", post({ phone })),
  verifyLoginOtp: async (phone: string, otp: string): Promise<{ token: string; user: AuthUser }> => {
    const b = await action("/logins/verifyloginotp", post({ phone, otp, device: await deviceId() }));
    const info = Array.isArray(b.info) ? (b.info[0] as Record<string, unknown> | undefined) : undefined;
    if (!info || typeof info.token !== "string") throw new ApiError("Login token missing from response.", 200);
    return {
      token: info.token,
      user: { name: String(info.name ?? ""), phone: String(info.phone ?? phone) },
    };
  },
  updateProfile: async (p: ProfileInput) =>
    action("/logins/updatecustomerinfo", { ...post({ ...p, device_id: await deviceId() }), auth: true }),
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

export const isBookingMode = (mode?: string) => mode?.toLowerCase() === "booking";
export const PHONE_RE = /^\d{10}$/;
