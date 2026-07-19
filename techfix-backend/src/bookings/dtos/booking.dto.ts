import { z } from "zod/v4";
import { BookingType, BookingPaymentMethod, RepairStage } from "../../config/constants";

export const createBookingDto = z
  .object({
    repairService: z.string().min(1, "Repair service is required"),
    repairOptionName: z.string().min(1, "Repair option is required"),
    bookingType: z.enum(Object.values(BookingType) as [string, ...string[]]),
    pickupAddress: z.string().optional(),
    contactName: z.string().min(2, "Full name is required"),
    contactPhone: z.string().min(1, "Phone number is required"),
    contactEmail: z.string().email("Invalid email address"),
    issueDescription: z.string().max(2000).optional(),
    issuePhotos: z.array(z.string().url()).max(6).optional().default([]),
    paymentMethod: z.enum(Object.values(BookingPaymentMethod) as [string, ...string[]]),
  })
  .refine(
    (data) => data.bookingType !== BookingType.PICKUP || !!data.pickupAddress?.trim(),
    {
      message: "Pickup address is required for pickup bookings",
      path: ["pickupAddress"],
    }
  );

export type CreateBookingDto = z.infer<typeof createBookingDto>;

// ─── Update Booking Status DTO (seller advancing the repair stage) ──
export const updateBookingStatusDto = z.object({
  stage: z.enum(Object.values(RepairStage) as [string, ...string[]]),
  note: z.string().max(500).optional(),
});

export type UpdateBookingStatusDto = z.infer<typeof updateBookingStatusDto>;
