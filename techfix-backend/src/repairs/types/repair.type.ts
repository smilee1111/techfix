import { ServiceOptionType } from "../../config/constants";

export interface IRepairLocation {
  address: string;
  city: string;
  coordinates?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
}

export interface IRepairOption {
  name: string;
  description?: string;
  price: number;
  estimatedTime?: string;
}

export interface IPriceRange {
  min: number;
  max: number;
}

export type RepairSortBy = "closest" | "rating" | "price";
export type RepairServiceType = "pickup" | "dropoff" | "both";

export interface RepairSearchFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  lat?: number;
  lng?: number;
  maxDistanceKm?: number;
  warrantyOnly?: boolean;
  serviceType?: RepairServiceType;
  sortBy?: RepairSortBy;
  page: number;
  limit: number;
}

export type { ServiceOptionType };
