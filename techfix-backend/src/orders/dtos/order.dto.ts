import { z } from "zod/v4";
import {
  PaymentMethod,
  PaymentMethodType,
  ORDER_TIMELINE_STAGES,
  OrderStatusType,
} from "../../config/constants";

const paymentValues = Object.values(PaymentMethod) as [
  PaymentMethodType,
  ...PaymentMethodType[],
];

// Only ladder stages are settable here — cancelling an order is a separate
// concern with its own rules, not just another step forward.
const stageValues = [...ORDER_TIMELINE_STAGES] as [OrderStatusType, ...OrderStatusType[]];

// ─── Create Order DTO ────────────────────────────────────────────
// The client sends product ids and quantities only — never prices. The
// server re-reads each product and computes the total itself, so a tampered
// request cannot change what is charged.
const orderLineDto = z.object({
  product: z.string().min(1, "Product id is required"),
  quantity: z.number().int().positive().max(99),
});

export const createOrderDto = z.object({
  items: z.array(orderLineDto).min(1, "Your cart is empty"),
  shippingAddress: z.object({
    fullName: z.string().min(1, "Full name is required"),
    phone: z.string().min(1, "Phone is required"),
    email: z.string().email("Enter a valid email"),
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().optional(),
    landmark: z.string().optional(),
  }),
  paymentMethod: z.enum(paymentValues),
});

export type CreateOrderDto = z.infer<typeof createOrderDto>;

// ─── Update Order Stage DTO ──────────────────────────────────────
export const updateOrderStatusDto = z.object({
  stage: z.enum(stageValues),
  note: z.string().max(500).optional(),
});

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusDto>;
