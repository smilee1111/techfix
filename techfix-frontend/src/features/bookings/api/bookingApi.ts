import { ENDPOINTS } from "@/lib/endpoints";
import type {
  BookingRequest,
  BookingResult,
  BookingListItem,
  StatusLogEntry,
} from "@/features/bookings/types/booking.types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapBooking(raw: any): BookingResult {
  return {
    id: raw._id,
    referenceId: raw.referenceId,
    repairOptionName: raw.repairOptionName,
    providerName: raw.repairService?.provider?.name ?? "Your Technician",
    subtotal: raw.subtotal,
    pickupDeliveryFee: raw.pickupDeliveryFee,
    serviceFee: raw.serviceFee,
    total: raw.total,
    status: raw.status,
    currentStage: raw.currentStage,
    estimatedPickupDate: raw.estimatedPickupDate,
  };
}

function mapListItem(raw: any): BookingListItem {
  return {
    id: raw._id,
    referenceId: raw.referenceId,
    repairServiceTitle: raw.repairService?.title ?? "Repair Service",
    repairOptionName: raw.repairOptionName,
    providerName: raw.repairService?.provider?.name ?? "Your Technician",
    customerName: raw.user?.name ?? "Customer",
    customerPhone: raw.user?.phone ?? "",
    customerEmail: raw.user?.email ?? "",
    total: raw.total,
    status: raw.status,
    currentStage: raw.currentStage,
    estimatedPickupDate: raw.estimatedPickupDate,
    createdAt: raw.createdAt,
  };
}

function mapStatusLog(raw: any): StatusLogEntry {
  return {
    stage: raw.stage,
    note: raw.note,
    updatedByName: raw.updatedBy?.name ?? "Provider",
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
 * Creates a booking for a specific repair option. Requires a bearer token.
 * All raw API calls are centralised here — never call fetch from components.
 */
export async function createBooking(
  accessToken: string,
  request: BookingRequest,
): Promise<BookingResult> {
  const response = await fetch(ENDPOINTS.bookings.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  const result = await parseOrThrow(response, "Could not confirm booking");
  return mapBooking(result.data.booking);
}

/**
 * Fetches a booking by id (used by the success page). Requires a bearer token.
 */
export async function getBookingById(accessToken: string, id: string): Promise<BookingResult> {
  const response = await fetch(ENDPOINTS.bookings.getById(id), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const result = await parseOrThrow(response, "Could not load booking");
  return mapBooking(result.data.booking);
}

/**
 * The logged-in customer's own bookings — powers "My Repairs".
 */
export async function getMyBookings(accessToken: string): Promise<BookingListItem[]> {
  const response = await fetch(ENDPOINTS.bookings.mine, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const result = await parseOrThrow(response, "Could not load your repairs");
  return (result.data.items ?? []).map(mapListItem);
}

/**
 * Bookings placed against the logged-in seller's own listings.
 */
export async function getIncomingBookings(accessToken: string): Promise<BookingListItem[]> {
  const response = await fetch(ENDPOINTS.bookings.incoming, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const result = await parseOrThrow(response, "Could not load incoming bookings");
  return (result.data.items ?? []).map(mapListItem);
}

/**
 * Advances a booking's repair stage. Seller (owner) or admin only.
 */
export async function updateBookingStatus(
  accessToken: string,
  bookingId: string,
  stage: string,
  note?: string,
): Promise<BookingListItem> {
  const response = await fetch(ENDPOINTS.bookings.updateStatus(bookingId), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ stage, note }),
  });
  const result = await parseOrThrow(response, "Could not update booking status");
  return mapListItem(result.data.booking);
}

/**
 * Full stage history for a booking (customer, owning seller, or admin).
 */
export async function getBookingStatusHistory(
  accessToken: string,
  bookingId: string,
): Promise<StatusLogEntry[]> {
  const response = await fetch(ENDPOINTS.bookings.statusHistory(bookingId), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const result = await parseOrThrow(response, "Could not load status history");
  return (result.data.logs ?? []).map(mapStatusLog);
}
