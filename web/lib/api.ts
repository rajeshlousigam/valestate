/**
 * ValEstate API client. When NEXT_PUBLIC_USE_API !== "true" the app runs on
 * mock data (so the static demo works with no backend); the auth provider and
 * account pages fall back accordingly.
 */
export const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/v1";
const REFRESH_KEY = "ve_refresh";

let accessToken: string | null = null;
export const setAccess = (t: string | null) => { accessToken = t; };
export const getAccess = () => accessToken;

export const getRefresh = () =>
  typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null;
export const setRefresh = (t: string | null) => {
  if (typeof window === "undefined") return;
  if (t) localStorage.setItem(REFRESH_KEY, t);
  else localStorage.removeItem(REFRESH_KEY);
};

export class ApiError extends Error {
  status: number;
  details?: { field: string; issue: string }[];
  constructor(message: string, status: number, details?: { field: string; issue: string }[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function tryRefresh(): Promise<boolean> {
  const r = getRefresh();
  if (!r) return false;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: r }),
    });
    if (!res.ok) throw new Error("refresh failed");
    const data = await res.json();
    setAccess(data.data.accessToken);
    setRefresh(data.data.refreshToken);
    return true;
  } catch {
    setAccess(null);
    setRefresh(null);
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function req(path: string, opts: RequestInit = {}, auth = false, retry = true): Promise<any> {
  const headers = new Headers(opts.headers);
  if (opts.body && !(opts.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (auth && accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (res.status === 401 && auth && retry && getRefresh()) {
    if (await tryRefresh()) return req(path, opts, auth, false);
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(data?.error?.message || `HTTP ${res.status}`, res.status, data?.error?.details);
  }
  return data;
}

export const api = {
  register: (b: { name: string; email: string; phone?: string; password: string; as: string }) =>
    req("/auth/register", { method: "POST", body: JSON.stringify(b) }),
  login: (email: string, password: string) =>
    req("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () =>
    req("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken: getRefresh() }) }).catch(() => {}),
  me: () => req("/me", {}, true),

  myProperties: () => req("/properties/mine", {}, true),
  createProperty: (b: unknown) => req("/properties", { method: "POST", body: JSON.stringify(b) }, true),
  uploadDoc: (uuid: string, file: File, docType: string) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("docType", docType);
    return req(`/properties/${uuid}/documents`, { method: "POST", body: fd }, true);
  },
  uploadMedia: (uuid: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return req(`/properties/${uuid}/media`, { method: "POST", body: fd }, true);
  },
  submitProperty: (uuid: string) => req(`/properties/${uuid}/submit`, { method: "POST" }, true),

  myInquiries: () => req("/inquiries/mine", {}, true),
  receivedInquiries: () => req("/inquiries/received", {}, true),
  createInquiry: (slug: string, message: string) =>
    req(`/listings/${slug}/inquiries`, { method: "POST", body: JSON.stringify({ message }) }, true),

  listings: (qs?: string) => req(`/listings${qs ? `?${qs}` : ""}`),
  listing: (slug: string) => req(`/listings/${slug}`),
};
