import { BookingTypeType, BookingPaymentMethodType, BookingStatusType } from "../../config/constants";

export interface BookingPriceBreakdown {
  subtotal: number;
  pickupDeliveryFee: number;
  serviceFee: number;
  total: number;
}

export type { BookingTypeType, BookingPaymentMethodType, BookingStatusType };
