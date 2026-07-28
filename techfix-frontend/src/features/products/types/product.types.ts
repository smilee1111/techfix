export type ProductCondition = "new" | "refurbished" | "used";
export type AuthenticityLabel = "genuine" | "refurbished" | "third_party";
export type ProductSortBy = "rating" | "price" | "newest";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface AuthenticityCheck {
  label: string;
  passed: boolean;
}

export interface ProductSeller {
  id: string;
  name: string;
  avatarUrl?: string;
  isVerifiedSeller: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  modelName?: string;
  description: string;
  price: number;
  originalPrice?: number;
  condition: ProductCondition;
  authenticityLabel: AuthenticityLabel;
  authenticityChecks: AuthenticityCheck[];
  certificateId?: string;
  warranty?: string;
  stock: number;
  images: string[];
  specs: ProductSpec[];
  compatibility: string[];
  city: string;
  seller: ProductSeller;
  category: ProductCategory;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
}

export interface ProductSearchFilters {
  q?: string;
  category?: string;
  brand?: string;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  city?: string;
  inStockOnly?: boolean;
  verifiedOnly?: boolean;
  sortBy?: ProductSortBy;
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  items: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  new: "New",
  refurbished: "Refurbished",
  used: "Used",
};

export const AUTHENTICITY_LABELS: Record<AuthenticityLabel, string> = {
  genuine: "Genuine",
  refurbished: "Refurbished",
  third_party: "Third-party",
};

export const PRODUCT_SORT_OPTIONS: { value: ProductSortBy; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top rated" },
  { value: "price", label: "Price: low to high" },
];

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  authorName: string;
  createdAt: string;
}
