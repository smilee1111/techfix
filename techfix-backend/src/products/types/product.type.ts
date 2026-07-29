import { AuthenticityLabelType, ProductConditionType } from "../../config/constants";

/** One row of the spec table on the product detail page. */
export interface IProductSpec {
  label: string;
  value: string;
}

/**
 * A single named authenticity check (e.g. "Serial number verified").
 * Stored per product rather than derived, so a seller's claims are an
 * explicit, auditable list rather than an implicit badge.
 */
export interface IAuthenticityCheck {
  label: string;
  passed: boolean;
}

export type ProductSortBy = "rating" | "price" | "newest";

export interface ProductSearchFilters {
  q?: string;
  category?: string;
  brand?: string;
  condition?: ProductConditionType;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  city?: string;
  inStockOnly?: boolean;
  verifiedOnly?: boolean;
  sortBy?: ProductSortBy;
  page: number;
  limit: number;
}

export type { AuthenticityLabelType, ProductConditionType };
