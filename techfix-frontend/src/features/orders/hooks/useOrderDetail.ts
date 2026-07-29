"use client";

import { useState, useEffect } from "react";
import { getOrderById, getOrderStatusHistory } from "@/features/orders/api/orderApi";
import { getValidAccessToken } from "@/lib/session";
import type { Order, OrderStatusLogEntry } from "@/features/orders/types/order.types";

interface UseOrderDetailReturn {
  order: Order | null;
  logs: OrderStatusLogEntry[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Loads one order together with its full fulfilment history.
 *
 * Same shape as useBookingDetail — both requests run in parallel off a
 * single token read, since the tracker is meaningless without the order.
 * Calls orderApi — never raw fetch.
 */
export function useOrderDetail(id: string): UseOrderDetailReturn {
  const [order, setOrder] = useState<Order | null>(null);
  const [logs, setLogs] = useState<OrderStatusLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getValidAccessToken()
      .then((token) => {
        if (!token) throw new Error("Please sign in to view this order");
        return Promise.all([getOrderById(token, id), getOrderStatusHistory(token, id)]);
      })
      .then(([orderResult, logResult]) => {
        if (cancelled) return;
        setOrder(orderResult);
        setLogs(logResult);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load this order");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { order, logs, isLoading, error };
}
