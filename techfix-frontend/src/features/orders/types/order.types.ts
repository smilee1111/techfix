export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "esewa" | "khalti" | "cash_on_delivery" | "bank_transfer";

/**
 * The fulfilment ladder, in timeline order — must stay in sync with
 * ORDER_TIMELINE_STAGES in the backend's config/constants.ts. Order is
 * meaningful: the tracker derives done/current/upcoming from each index.
 * "cancelled" is deliberately absent — it is a terminal state, not a step.
 */
export const ORDER_STAGES: { value: OrderStatus; label: string }[] = [
  { value: "placed", label: "Order Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  esewa: "eSewa",
  khalti: "Khalti",
  cash_on_delivery: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
};

export interface OrderItem {
  productId: string;
  title: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  image?: string;
  sellerName: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  postalCode?: string;
  landmark?: string;
}

export interface Order {
  id: string;
  referenceId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  estimatedDeliveryDate: string;
  createdAt: string;
}

/** Request body — prices are never sent; the server computes every total. */
export interface CreateOrderRequest {
  items: { product: string; quantity: number }[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
}

export interface OrderStatusLogEntry {
  stage: OrderStatus;
  note?: string;
  updatedByName: string;
  timestamp: string;
}
