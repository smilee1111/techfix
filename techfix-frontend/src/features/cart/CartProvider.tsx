"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { CartItem, CartTotals } from "@/features/cart/types/cart.types";

const STORAGE_KEY = "techfix_cart";
const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_FEE = 8;

interface CartContextValue {
  items: CartItem[];
  totals: CartTotals;
  /** True until the stored cart has been read — prevents an empty-cart flash. */
  isReady: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt or unreadable storage should never break the app — an empty
    // cart is a safe fallback.
    return [];
  }
}

/**
 * Cart state, persisted to localStorage.
 *
 * Deliberately client-side only for this sprint: there is no cart endpoint
 * on the backend, and a server-side cart is only worth building once orders
 * exist to convert it into. The storage shape is the same one a future
 * server cart would sync, so that migration stays additive.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Read once on mount rather than in a useState initialiser — localStorage
  // does not exist during the server render, and reading it there would
  // produce a hydration mismatch.
  useEffect(() => {
    setItems(readStoredCart());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* quota or private-mode failures shouldn't break checkout */
    }
  }, [items, isReady]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (!existing) {
        return [...prev, { ...item, quantity: Math.min(quantity, item.maxStock || quantity) }];
      }
      // Adding an item already in the cart increments it, capped at stock.
      const nextQuantity = Math.min(existing.quantity + quantity, item.maxStock || Infinity);
      return prev.map((i) =>
        i.productId === item.productId ? { ...i, quantity: nextQuantity } : i,
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, i.maxStock || quantity) }
              : i,
          ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totals = useMemo<CartTotals>(() => {
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    return { itemCount, subtotal, shipping, total: subtotal + shipping };
  }, [items]);

  const value = useMemo(
    () => ({ items, totals, isReady, addItem, removeItem, setQuantity, clear }),
    [items, totals, isReady, addItem, removeItem, setQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return context;
}

export { FREE_SHIPPING_THRESHOLD };
