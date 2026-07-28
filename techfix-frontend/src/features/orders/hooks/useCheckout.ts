"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/features/orders/api/orderApi";
import { getValidAccessToken } from "@/lib/session";
import { useCart } from "@/features/cart/CartProvider";
import type {
  ShippingAddress,
  PaymentMethod,
} from "@/features/orders/types/order.types";

interface UseCheckoutReturn {
  isSubmitting: boolean;
  error: string | null;
  placeOrder: (address: ShippingAddress, paymentMethod: PaymentMethod) => Promise<void>;
  clearError: () => void;
}

/**
 * Converts the cart into a real order.
 *
 * The cart is only cleared after the server confirms — clearing optimistically
 * would lose the shopper's basket if the request failed (for example when an
 * item sold out between browsing and checkout).
 * Calls orderApi — never raw fetch.
 */
export function useCheckout(): UseCheckoutReturn {
  const router = useRouter();
  const { items, clear } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeOrder = useCallback(
    async (address: ShippingAddress, paymentMethod: PaymentMethod) => {
      if (items.length === 0) {
        setError("Your cart is empty");
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const token = await getValidAccessToken();
        if (!token) throw new Error("Please sign in to place your order");

        const order = await createOrder(token, {
          // Prices are deliberately omitted — the server prices the order.
          items: items.map((i) => ({ product: i.productId, quantity: i.quantity })),
          shippingAddress: address,
          paymentMethod,
        });

        clear();
        router.push(`/orders/${order.id}/success`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not place your order");
      } finally {
        setIsSubmitting(false);
      }
    },
    [items, clear, router],
  );

  const clearError = useCallback(() => setError(null), []);

  return { isSubmitting, error, placeOrder, clearError };
}
