/** TanStack Query hooks over the Estara API (lib/api.ts). */
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { useAuth } from "./auth";
import type { Id, ListingRequestInput, SearchFilters } from "./types";

const MASTER_STALE = 60 * 60_000; // server caches masters for 3600s

export const useStates = () => useQuery({ queryKey: ["m", "states"], queryFn: api.states, staleTime: MASTER_STALE });
export const useDistricts = () =>
  useQuery({ queryKey: ["m", "districts"], queryFn: api.districts, staleTime: MASTER_STALE });
export const useRealEstateTypes = () =>
  useQuery({ queryKey: ["m", "retypes"], queryFn: api.realEstateTypes, staleTime: MASTER_STALE });
export const usePropertyTypes = () =>
  useQuery({ queryKey: ["m", "ptypes"], queryFn: api.propertyTypes, staleTime: MASTER_STALE });
export const useBudgets = () => useQuery({ queryKey: ["m", "budgets"], queryFn: api.budgets, staleTime: MASTER_STALE });
export const useBanners = () => useQuery({ queryKey: ["m", "banners"], queryFn: api.banners, staleTime: MASTER_STALE });
export const useHowVerify = () =>
  useQuery({ queryKey: ["m", "howverify"], queryFn: api.howVerify, staleTime: MASTER_STALE });

export const useLatestEnquiry = () => useQuery({ queryKey: ["latest", "enquiry"], queryFn: api.latestEnquiry });
export const useLatestBooking = () => useQuery({ queryKey: ["latest", "booking"], queryFn: api.latestBooking });

export const hasFilters = (f: SearchFilters) =>
  !!(f.real_estate_type_id || f.property_type_id || f.budget_id || f.state_id || f.district_id);

/**
 * The API has separate endpoints for text search and structured filters; they
 * can't be combined server-side. Structured filters win when set, text search
 * otherwise (an empty search returns all published properties).
 */
export function useSearch(f: SearchFilters) {
  return useInfiniteQuery({
    queryKey: ["search", f],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      hasFilters(f) ? api.filter(f, pageParam) : api.search(f.search?.trim() ?? "", pageParam),
    getNextPageParam: (last) => (last.pagination.hasMore ? last.pagination.currentPage + 1 : undefined),
  });
}

export function useDetail(slug: string) {
  return useQuery({ queryKey: ["detail", slug], queryFn: () => api.detail(slug), enabled: !!slug });
}

export function useHistory() {
  const { user } = useAuth();
  return useQuery({ queryKey: ["history"], queryFn: api.history, enabled: !!user });
}

export function useEnquire() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: Id) => api.enquire(propertyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["history"] }),
  });
}

export function useBookSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { propertyId: Id; timeSlotId: Id }) => api.bookSite(v.propertyId, v.timeSlotId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["history"] }),
  });
}

export function useRequestListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: ListingRequestInput) => api.requestListing(b),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["history"] }),
  });
}
