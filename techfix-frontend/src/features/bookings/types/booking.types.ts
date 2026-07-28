export type BookingType = "pickup" | "dropoff";
export type BookingPaymentMethod = "card" | "digital_wallet" | "pay_at_pickup";
export type RepairStage =
  | "received"
  | "diagnosing"
  | "awaiting_parts"
  | "repairing"
  | "quality_check"
  | "ready_for_pickup"
  | "delivered";

/**
 * The canonical stage ladder, in timeline order — must stay in sync with
 * RepairStage in the backend's config/constants.ts. Order is meaningful:
 * the timeline derives done/current/upcoming from each stage's index here.
 */
export const REPAIR_STAGES: { value: RepairStage; label: string }[] = [
  { value: "received", label: "Received" },
  { value: "diagnosing", label: "Diagnosing" },
  { value: "awaiting_parts", label: "Awaiting Parts" },
  { value: "repairing", label: "Repairing" },
  { value: "quality_check", label: "Quality Check" },
  { value: "ready_for_pickup", label: "Ready for Pickup" },
  { value: "delivered", label: "Delivered" },
];

export interface BookingRequest {
  repairService: string;
  repairOptionName: string;
  bookingType: BookingType;
  pickupAddress?: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  issueDescription?: string;
  issuePhotos?: string[];
  paymentMethod: BookingPaymentMethod;
}

export interface BookingResult {
  id: string;
  referenceId: string;
  repairOptionName: string;
  providerName: string;
  subtotal: number;
  pickupDeliveryFee: number;
  serviceFee: number;
  total: number;
  status: string;
  currentStage: RepairStage;
  estimatedPickupDate: string;
}

/** A row in either the customer's "My Repairs" list or the seller's "Incoming Bookings" queue. */
export interface BookingListItem {
  id: string;
  referenceId: string;
  repairServiceTitle: string;
  repairOptionName: string;
  providerName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  total: number;
  status: string;
  currentStage: RepairStage;
  estimatedPickupDate: string;
  createdAt: string;
}

/**
 * Everything the booking detail / timeline page shows. Extends BookingResult
 * so the success page keeps working off the same fetch.
 */
export interface BookingDetail extends BookingResult {
  repairServiceTitle: string;
  bookingType: BookingType;
  pickupAddress?: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  issueDescription?: string;
  issuePhotos: string[];
  paymentMethod: BookingPaymentMethod;
  createdAt: string;
}

export interface StatusLogEntry {
  stage: RepairStage;
  note?: string;
  updatedByName: string;
  timestamp: string;
}

export const PAYMENT_METHOD_LABELS: Record<BookingPaymentMethod, string> = {
  card: "Card",
  digital_wallet: "Digital Wallet",
  pay_at_pickup: "Pay at Pickup",
};
