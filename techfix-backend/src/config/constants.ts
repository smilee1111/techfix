// ─── User Roles ──────────────────────────────────────────────────
// Exactly 3 roles. "seller" covers anyone listing something on the
// marketplace — repair providers and product sellers alike — there is
// no separate repair_provider role.
export const UserRole = {
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
} as const;
export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// ─── Category Types ──────────────────────────────────────────────
export const CategoryType = {
  PRODUCT: "product",
  REPAIR: "repair",
} as const;
export type CategoryTypeType = (typeof CategoryType)[keyof typeof CategoryType];

// ─── Authenticity Labels ─────────────────────────────────────────
export const AuthenticityLabel = {
  GENUINE: "genuine",
  REFURBISHED: "refurbished",
  THIRD_PARTY: "third_party",
} as const;
export type AuthenticityLabelType =
  (typeof AuthenticityLabel)[keyof typeof AuthenticityLabel];

// ─── Booking Status ──────────────────────────────────────────────
export const BookingStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;
export type BookingStatusType =
  (typeof BookingStatus)[keyof typeof BookingStatus];

// ─── Booking Type ────────────────────────────────────────────────
export const BookingType = {
  PICKUP: "pickup",
  DROPOFF: "dropoff",
  ON_SITE: "on_site",
} as const;
export type BookingTypeType = (typeof BookingType)[keyof typeof BookingType];

// ─── Booking Payment Method (booking-time preference, not a real gateway
// charge yet — separate from PaymentMethod, which is Nepal-specific and
// used for actual product-order payment integration) ────────────────────
export const BookingPaymentMethod = {
  CARD: "card",
  DIGITAL_WALLET: "digital_wallet",
  PAY_AT_PICKUP: "pay_at_pickup",
} as const;
export type BookingPaymentMethodType =
  (typeof BookingPaymentMethod)[keyof typeof BookingPaymentMethod];

// ─── Repair Stages (5-stage timeline from Design_guide.md) ──────
export const RepairStage = {
  RECEIVED: "received",
  DIAGNOSING: "diagnosing",
  REPAIRING: "repairing",
  READY_FOR_PICKUP: "ready_for_pickup",
  DELIVERED: "delivered",
} as const;
export type RepairStageType = (typeof RepairStage)[keyof typeof RepairStage];

// ─── Service Options ─────────────────────────────────────────────
export const ServiceOption = {
  PICKUP: "pickup",
  DROPOFF: "dropoff",
  ON_SITE: "on_site",
} as const;
export type ServiceOptionType =
  (typeof ServiceOption)[keyof typeof ServiceOption];

// ─── Order Status ────────────────────────────────────────────────
export const OrderStatus = {
  PLACED: "placed",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;
export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

// ─── Payment Method ──────────────────────────────────────────────
export const PaymentMethod = {
  ESEWA: "esewa",
  KHALTI: "khalti",
  CASH_ON_DELIVERY: "cash_on_delivery",
  BANK_TRANSFER: "bank_transfer",
} as const;
export type PaymentMethodType =
  (typeof PaymentMethod)[keyof typeof PaymentMethod];

// ─── Payment Status ──────────────────────────────────────────────
export const PaymentStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;
export type PaymentStatusType =
  (typeof PaymentStatus)[keyof typeof PaymentStatus];

// ─── Payment For ─────────────────────────────────────────────────
export const PaymentFor = {
  ORDER: "order",
  BOOKING: "booking",
} as const;
export type PaymentForType = (typeof PaymentFor)[keyof typeof PaymentFor];

// ─── Estimate Status ─────────────────────────────────────────────
export const EstimateStatus = {
  REQUESTED: "requested",
  QUOTED: "quoted",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EXPIRED: "expired",
} as const;
export type EstimateStatusType =
  (typeof EstimateStatus)[keyof typeof EstimateStatus];

// ─── Review Type ─────────────────────────────────────────────────
export const ReviewType = {
  PRODUCT: "product",
  REPAIR_SERVICE: "repair_service",
} as const;
export type ReviewTypeType = (typeof ReviewType)[keyof typeof ReviewType];

// ─── Support Ticket Status ───────────────────────────────────────
export const TicketStatus = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  ESCALATED: "escalated",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;
export type TicketStatusType =
  (typeof TicketStatus)[keyof typeof TicketStatus];

// ─── Ticket Priority ─────────────────────────────────────────────
export const TicketPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;
export type TicketPriorityType =
  (typeof TicketPriority)[keyof typeof TicketPriority];

// ─── Contact Method ──────────────────────────────────────────────
export const ContactMethod = {
  CHAT: "chat",
  CALL: "call",
  EMAIL: "email",
} as const;
export type ContactMethodType =
  (typeof ContactMethod)[keyof typeof ContactMethod];

// ─── Refund Status ───────────────────────────────────────────────
export const RefundStatus = {
  REQUESTED: "requested",
  APPROVED: "approved",
  PROCESSING: "processing",
  COMPLETED: "completed",
  REJECTED: "rejected",
} as const;
export type RefundStatusType =
  (typeof RefundStatus)[keyof typeof RefundStatus];

// ─── Notification Type ───────────────────────────────────────────
export const NotificationType = {
  BOOKING_CONFIRMED: "booking_confirmed",
  BOOKING_CANCELLED: "booking_cancelled",
  REPAIR_STATUS_UPDATE: "repair_status_update",
  ORDER_PLACED: "order_placed",
  ORDER_CONFIRMED: "order_confirmed",
  ORDER_SHIPPED: "order_shipped",
  ORDER_DELIVERED: "order_delivered",
  ORDER_CANCELLED: "order_cancelled",
  ESTIMATE_RECEIVED: "estimate_received",
  ESTIMATE_EXPIRED: "estimate_expired",
  PAYMENT_SUCCESS: "payment_success",
  PAYMENT_FAILED: "payment_failed",
  REFUND_APPROVED: "refund_approved",
  REFUND_COMPLETED: "refund_completed",
  REFUND_REJECTED: "refund_rejected",
  TICKET_UPDATE: "ticket_update",
  TICKET_RESOLVED: "ticket_resolved",
} as const;
export type NotificationTypeType =
  (typeof NotificationType)[keyof typeof NotificationType];
