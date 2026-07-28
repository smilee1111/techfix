import { ENDPOINTS } from "@/lib/endpoints";
import type {
  RepairListing,
  RepairListingInput,
  RepairSearchFilters,
  RepairSearchResult,
} from "@/features/repairs/types/repair.types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapListing(raw: any): RepairListing {
  return {
    id: raw._id,
    title: raw.title,
    deviceType: raw.deviceType,
    description: raw.description,
    provider: {
      id: raw.provider?._id ?? raw.provider,
      name: raw.provider?.name ?? "Unknown Provider",
      avatarUrl: raw.provider?.avatar,
      isVerifiedSeller: !!raw.provider?.isVerifiedSeller,
    },
    category: {
      id: raw.category?._id ?? raw.category,
      name: raw.category?.name ?? "",
      slug: raw.category?.slug ?? "",
    },
    priceRange: raw.priceRange,
    repairOptions: raw.repairOptions ?? [],
    estimatedTime: raw.estimatedTime,
    warranty: raw.warranty,
    readyBy: raw.readyBy,
    location: { address: raw.location?.address, city: raw.location?.city },
    averageRating: raw.averageRating ?? 0,
    totalReviews: raw.totalReviews ?? 0,
    serviceOptions: raw.serviceOptions ?? [],
    isVerified: !!raw.isVerified,
    // Public search only returns active listings, so a missing flag means
    // active; the seller dashboard receives the real value.
    isActive: raw.isActive !== false,
    distanceKm:
      typeof raw.distanceMeters === "number" ? raw.distanceMeters / 1000 : undefined,
  };
}

function buildQuery(filters: RepairSearchFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.minRating !== undefined) params.set("minRating", String(filters.minRating));
  if (filters.lat !== undefined) params.set("lat", String(filters.lat));
  if (filters.lng !== undefined) params.set("lng", String(filters.lng));
  if (filters.maxDistanceKm !== undefined) params.set("maxDistanceKm", String(filters.maxDistanceKm));
  if (filters.warrantyOnly) params.set("warrantyOnly", "true");
  if (filters.serviceType) params.set("serviceType", filters.serviceType);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  return params.toString();
}

/**
 * Searches repair service listings with filters, sorting and pagination.
 * All raw API calls are centralised here — never call fetch from components.
 */
export async function searchRepairs(filters: RepairSearchFilters): Promise<RepairSearchResult> {
  const response = await fetch(`${ENDPOINTS.repairs.search}?${buildQuery(filters)}`);

  const result = await response.json().catch(() => ({ message: "Search failed" }));
  if (!response.ok) {
    throw new Error(result.message ?? "Could not search repair services");
  }

  return {
    items: (result.data.items ?? []).map(mapListing),
    pagination: result.data.pagination,
  };
}

/**
 * Fetches a single repair service listing by id.
 */
export async function getRepairById(id: string): Promise<RepairListing> {
  const response = await fetch(ENDPOINTS.repairs.getById(id));

  const result = await response.json().catch(() => ({ message: "Could not load listing" }));
  if (!response.ok) {
    throw new Error(result.message ?? "Could not load repair service");
  }

  return mapListing(result.data.repairService);
}

/**
 * Fetches 2–3 repair service listings for side-by-side comparison.
 */
export async function compareRepairs(ids: string[]): Promise<RepairListing[]> {
  const response = await fetch(ENDPOINTS.repairs.compare(ids));

  const result = await response.json().catch(() => ({ message: "Could not load comparison" }));
  if (!response.ok) {
    throw new Error(result.message ?? "Could not load comparison");
  }

  return (result.data.items ?? []).map(mapListing);
}

/**
 * The logged-in seller's own repair-service listings. Requires a bearer token.
 */
export async function getMyRepairListings(accessToken: string): Promise<RepairListing[]> {
  const response = await fetch(ENDPOINTS.repairs.mine, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const result = await response.json().catch(() => ({ message: "Could not load your listings" }));
  if (!response.ok) {
    throw new Error(result.message ?? "Could not load your listings");
  }

  return (result.data.items ?? []).map(mapListing);
}

async function parseOrThrow(response: Response, fallback: string) {
  const result = await response.json().catch(() => ({ message: fallback }));
  if (!response.ok) {
    throw new Error(result.message ?? fallback);
  }
  return result;
}

/**
 * Creates a repair-service listing owned by the logged-in seller.
 */
export async function createRepairListing(
  accessToken: string,
  input: RepairListingInput,
): Promise<RepairListing> {
  const response = await fetch(ENDPOINTS.repairs.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  });
  const result = await parseOrThrow(response, "Could not create listing");
  return mapListing(result.data.repairService);
}

/**
 * Edits an existing listing. The backend rejects this unless the caller
 * owns the listing (or is an admin).
 */
export async function updateRepairListing(
  accessToken: string,
  id: string,
  input: Partial<RepairListingInput>,
): Promise<RepairListing> {
  const response = await fetch(ENDPOINTS.repairs.update(id), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  });
  const result = await parseOrThrow(response, "Could not update listing");
  return mapListing(result.data.repairService);
}

/**
 * Soft-deletes or restores a listing. Listings are never hard-deleted so
 * that past bookings keep resolving their repairService reference.
 */
export async function setRepairListingActive(
  accessToken: string,
  id: string,
  isActive: boolean,
): Promise<RepairListing> {
  const response = await fetch(ENDPOINTS.repairs.setActive(id), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ isActive }),
  });
  const result = await parseOrThrow(response, "Could not update listing status");
  return mapListing(result.data.repairService);
}
