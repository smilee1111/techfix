import { ENDPOINTS } from "@/lib/endpoints";
import type {
  Product,
  ProductSearchFilters,
  ProductSearchResult,
  Review,
} from "@/features/products/types/product.types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapProduct(raw: any): Product {
  return {
    id: raw._id,
    title: raw.title,
    brand: raw.brand,
    modelName: raw.modelName,
    description: raw.description,
    price: raw.price,
    originalPrice: raw.originalPrice,
    condition: raw.condition,
    authenticityLabel: raw.authenticityLabel,
    authenticityChecks: raw.authenticityChecks ?? [],
    certificateId: raw.certificateId,
    warranty: raw.warranty,
    stock: raw.stock ?? 0,
    images: raw.images ?? [],
    specs: raw.specs ?? [],
    compatibility: raw.compatibility ?? [],
    city: raw.city ?? "",
    seller: {
      id: raw.seller?._id ?? raw.seller,
      name: raw.seller?.name ?? "Unknown Seller",
      avatarUrl: raw.seller?.avatar,
      isVerifiedSeller: !!raw.seller?.isVerifiedSeller,
    },
    category: {
      id: raw.category?._id ?? raw.category,
      name: raw.category?.name ?? "",
      slug: raw.category?.slug ?? "",
    },
    averageRating: raw.averageRating ?? 0,
    totalReviews: raw.totalReviews ?? 0,
    isVerified: !!raw.isVerified,
    isActive: raw.isActive !== false,
  };
}

function mapReview(raw: any): Review {
  return {
    id: raw._id,
    rating: raw.rating,
    comment: raw.comment,
    authorName: raw.user?.name ?? "Verified buyer",
    createdAt: raw.createdAt,
  };
}

function buildQuery(filters: ProductSearchFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.condition) params.set("condition", filters.condition);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.minRating !== undefined) params.set("minRating", String(filters.minRating));
  if (filters.city) params.set("city", filters.city);
  if (filters.inStockOnly) params.set("inStockOnly", "true");
  if (filters.verifiedOnly) params.set("verifiedOnly", "true");
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  return params.toString();
}

async function parseOrThrow(response: Response, fallback: string) {
  const result = await response.json().catch(() => ({ message: fallback }));
  if (!response.ok) {
    throw new Error(result.message ?? fallback);
  }
  return result;
}

/**
 * Searches products with filters, sorting and pagination.
 * All raw API calls are centralised here — never call fetch from components.
 */
export async function searchProducts(
  filters: ProductSearchFilters,
): Promise<ProductSearchResult> {
  const query = buildQuery(filters);
  const response = await fetch(`${ENDPOINTS.products.search}${query ? `?${query}` : ""}`);
  const result = await parseOrThrow(response, "Could not load products");

  return {
    items: (result.data.items ?? []).map(mapProduct),
    pagination: result.data.pagination,
  };
}

export async function getProductById(id: string): Promise<Product> {
  const response = await fetch(ENDPOINTS.products.getById(id));
  const result = await parseOrThrow(response, "Could not load product");
  return mapProduct(result.data.product);
}

/** Side-by-side seller comparison — 2 to 3 ids. */
export async function compareProducts(ids: string[]): Promise<Product[]> {
  const response = await fetch(ENDPOINTS.products.compare(ids));
  const result = await parseOrThrow(response, "Could not compare products");
  return (result.data.items ?? []).map(mapProduct);
}

/** Distinct brands across active products — powers the brand filter. */
export async function getBrands(): Promise<string[]> {
  const response = await fetch(ENDPOINTS.products.brands);
  const result = await parseOrThrow(response, "Could not load brands");
  return result.data.brands ?? [];
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const response = await fetch(ENDPOINTS.reviews.list("product", productId));
  const result = await parseOrThrow(response, "Could not load reviews");
  return (result.data.reviews ?? []).map(mapReview);
}

/** Leaving a review requires an account, so ratings trace to a real user. */
export async function createProductReview(
  accessToken: string,
  productId: string,
  rating: number,
  comment?: string,
): Promise<Review> {
  const response = await fetch(ENDPOINTS.reviews.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ targetType: "product", target: productId, rating, comment }),
  });
  const result = await parseOrThrow(response, "Could not submit review");
  return mapReview(result.data.review);
}
