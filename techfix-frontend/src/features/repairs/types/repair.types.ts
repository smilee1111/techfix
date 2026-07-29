export interface RepairOption {
  name: string;
  description?: string;
  price: number;
  estimatedTime?: string;
}

export interface RepairProvider {
  id: string;
  name: string;
  avatarUrl?: string;
  isVerifiedSeller: boolean;
}

export interface RepairCategory {
  id: string;
  name: string;
  slug: string;
}

export interface RepairListing {
  id: string;
  title: string;
  deviceType: string;
  description: string;
  provider: RepairProvider;
  category: RepairCategory;
  priceRange: { min: number; max: number };
  repairOptions: RepairOption[];
  estimatedTime?: string;
  warranty?: string;
  readyBy?: string;
  location: { address: string; city: string };
  averageRating: number;
  totalReviews: number;
  serviceOptions: string[];
  isVerified: boolean;
  /** Soft-delete flag. Public search only ever returns active listings; the
   *  seller's own dashboard sees both so a listing can be re-activated. */
  isActive: boolean;
  distanceKm?: number;
}

export const SERVICE_OPTIONS: { value: string; label: string }[] = [
  { value: "pickup", label: "Pickup" },
  { value: "dropoff", label: "Drop-off" },
  { value: "on_site", label: "On-site" },
];

/** Request body for creating or editing a listing — mirrors the backend DTO. */
export interface RepairListingInput {
  category: string;
  deviceType: string;
  title: string;
  description: string;
  priceRange: { min: number; max: number };
  repairOptions: RepairOption[];
  estimatedTime?: string;
  warranty?: string;
  readyBy?: string;
  location: { address: string; city: string };
  serviceOptions: string[];
}

export interface RepairSearchFilters {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  lat?: number;
  lng?: number;
  maxDistanceKm?: number;
  warrantyOnly?: boolean;
  serviceType?: "pickup" | "dropoff" | "both";
  sortBy?: "closest" | "rating" | "price";
  page?: number;
  limit?: number;
}

export interface RepairSearchResult {
  items: RepairListing[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
