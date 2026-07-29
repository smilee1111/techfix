"use client";

import { useState, useEffect } from "react";
import { getMyOrders } from "@/features/orders/api/orderApi";
import { getValidAccessToken } from "@/lib/session";
import type { Order } from "@/features/orders/types/order.types";

interface UseMyOrdersReturn {
  items: Order[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Loads the logged-in customer's own orders for "Order History".
 * Calls orderApi.getMyOrders — never raw fetch.
 */
export function useMyOrders(): UseMyOrdersReturn {
  const [items, setItems] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getValidAccessToken()
      .then((token) => {
        if (!token) throw new Error("Please sign in to view your orders");
        return getMyOrders(token);
      })
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load your orders");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { items, isLoading, error };
}
