"use client";

import { useState, useEffect } from "react";
import { getProductById, getProductReviews } from "@/features/products/api/productApi";
import type { Product, Review } from "@/features/products/types/product.types";

interface UseProductDetailReturn {
  product: Product | null;
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Loads a product together with its reviews.
 *
 * Both are public reads and neither depends on the other, so they run in
 * parallel. A review-fetch failure is swallowed: the product page is still
 * useful without the review list, and failing the whole page over it would
 * be a worse trade.
 * Calls productApi — never raw fetch.
 */
export function useProductDetail(id: string): UseProductDetailReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([getProductById(id), getProductReviews(id).catch(() => [] as Review[])])
      .then(([productResult, reviewResult]) => {
        if (cancelled) return;
        setProduct(productResult);
        setReviews(reviewResult);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load this product");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { product, reviews, isLoading, error };
}
