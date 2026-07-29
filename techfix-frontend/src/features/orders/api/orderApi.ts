import { ENDPOINTS } from "@/lib/endpoints";
import type {
  Order,
  CreateOrderRequest,
  OrderStatusLogEntry,
} from "@/features/orders/types/order.types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapOrder(raw: any): Order {
  return {
    id: raw._id,
    referenceId: raw.referenceId,
    items: (raw.items ?? []).map((item: any) => ({
      productId: item.product?._id ?? item.product,
      title: item.title,
      brand: item.brand,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      image: item.image,
      sellerName: item.sellerName,
    })),
    shippingAddress: raw.shippingAddress ?? {},
    paymentMethod: raw.paymentMethod,
    subtotal: raw.subtotal,
    shippingFee: raw.shippingFee,
    total: raw.total,
    status: raw.status,
    estimatedDeliveryDate: raw.estimatedDeliveryDate,
    createdAt: raw.createdAt,
  };
}

function mapStatusLog(raw: any): OrderStatusLogEntry {
  return {
    stage: raw.stage,
    note: raw.note,
    updatedByName: raw.updatedBy?.name ?? "TechFix",
    timestamp: raw.timestamp,
  };
}

async function parseOrThrow(response: Response, fallback: string) {
  const result = await response.json().catch(() => ({ message: fallback }));
  if (!response.ok) {
    throw new Error(result.message ?? fallback);
  }
  return result;
}

/**
 * Places an order. Only product ids and quantities are sent — the server
 * re-reads each product and computes every total itself.
 * All raw API calls are centralised here — never call fetch from components.
 */
export async function createOrder(
  accessToken: string,
  request: CreateOrderRequest,
): Promise<Order> {
  const response = await fetch(ENDPOINTS.orders.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  const result = await parseOrThrow(response, "Could not place your order");
  return mapOrder(result.data.order);
}

export async function getOrderById(accessToken: string, id: string): Promise<Order> {
  const response = await fetch(ENDPOINTS.orders.getById(id), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const result = await parseOrThrow(response, "Could not load order");
  return mapOrder(result.data.order);
}

/** The logged-in customer's own orders — powers "Order History". */
export async function getMyOrders(accessToken: string): Promise<Order[]> {
  const response = await fetch(ENDPOINTS.orders.mine, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const result = await parseOrThrow(response, "Could not load your orders");
  return (result.data.items ?? []).map(mapOrder);
}

/** Full fulfilment history for an order (customer or admin). */
export async function getOrderStatusHistory(
  accessToken: string,
  orderId: string,
): Promise<OrderStatusLogEntry[]> {
  const response = await fetch(ENDPOINTS.orders.statusHistory(orderId), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const result = await parseOrThrow(response, "Could not load tracking history");
  return (result.data.logs ?? []).map(mapStatusLog);
}
