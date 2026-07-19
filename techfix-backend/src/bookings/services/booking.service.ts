import { BookingRepository } from "../repositories/booking.repository";
import { RepairRepository } from "../../repairs/repositories/repair.repository";
import { CreateBookingDto, UpdateBookingStatusDto } from "../dtos/booking.dto";
import { BookingType, BookingStatus, RepairStage, RepairStageType } from "../../config/constants";
import { NotFoundError } from "../../errors/NotFoundError";
import { ValidationError } from "../../errors/ValidationError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import type { IBookingDocument } from "../models/booking.model";

const PICKUP_DELIVERY_FEE = 12;
const SERVICE_FEE = 5;

/** Coarse booking.status that follows from a fine-grained stage change. */
function statusForStage(stage: RepairStageType) {
  if (stage === RepairStage.DELIVERED) return BookingStatus.COMPLETED;
  return BookingStatus.IN_PROGRESS;
}

interface PopulatedProvider {
  repairService: { provider?: { _id: { toString(): string } } | string };
}

function ownerIdOf(booking: PopulatedProvider): string | undefined {
  const provider = booking.repairService?.provider;
  if (!provider) return undefined;
  return typeof provider === "string" ? provider : provider._id.toString();
}

function generateReferenceId(): string {
  const digits = Math.floor(10000 + Math.random() * 90000);
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `TF-${digits}-${letter}`;
}

/**
 * Booking Service
 * Turns a selected repair option into a confirmed booking with a
 * server-computed price breakdown — the client never sends a price.
 */
export class BookingService {
  private bookingRepository: BookingRepository;
  private repairRepository: RepairRepository;

  constructor() {
    this.bookingRepository = new BookingRepository();
    this.repairRepository = new RepairRepository();
  }

  async create(userId: string, dto: CreateBookingDto) {
    const repairService = await this.repairRepository.findById(dto.repairService);
    if (!repairService) {
      throw new NotFoundError("Repair service");
    }

    const option = repairService.repairOptions.find(
      (o) => o.name.toLowerCase() === dto.repairOptionName.toLowerCase()
    );
    if (!option) {
      throw new ValidationError("Selected repair option is no longer available");
    }

    const pickupDeliveryFee = dto.bookingType === BookingType.PICKUP ? PICKUP_DELIVERY_FEE : 0;
    const subtotal = option.price;
    const total = subtotal + pickupDeliveryFee + SERVICE_FEE;

    let referenceId = generateReferenceId();
    while (await this.bookingRepository.referenceIdExists(referenceId)) {
      referenceId = generateReferenceId();
    }

    const estimatedPickupDate = new Date();
    estimatedPickupDate.setDate(estimatedPickupDate.getDate() + 2);
    estimatedPickupDate.setHours(10, 0, 0, 0);

    const booking = await this.bookingRepository.create({
      referenceId,
      user: userId,
      repairService: dto.repairService,
      repairOptionName: option.name,
      bookingType: dto.bookingType,
      pickupAddress: dto.pickupAddress,
      contactName: dto.contactName,
      contactPhone: dto.contactPhone,
      contactEmail: dto.contactEmail,
      issueDescription: dto.issueDescription,
      issuePhotos: dto.issuePhotos,
      paymentMethod: dto.paymentMethod,
      subtotal,
      pickupDeliveryFee,
      serviceFee: SERVICE_FEE,
      total,
      estimatedPickupDate,
    } as unknown as Partial<IBookingDocument>);

    return { booking };
  }

  async getById(id: string) {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError("Booking");
    }
    return { booking };
  }

  /** The logged-in customer's own bookings — powers "My Repairs". */
  async getMine(userId: string) {
    const items = await this.bookingRepository.findByUser(userId);
    return { items };
  }

  /** Bookings placed against the logged-in seller's own listings. */
  async getIncoming(sellerId: string) {
    const myListings = await this.repairRepository.findByProvider(sellerId);
    const items = await this.bookingRepository.findByRepairServiceIds(
      myListings.map((l) => l._id.toString())
    );
    return { items };
  }

  /**
   * Advances a booking's repair stage. Only the seller who owns the
   * underlying repair-service listing (or an admin) may do this —
   * verified from the booking's populated repairService.provider, not
   * trusted from the request.
   */
  async updateStatus(requesterId: string, isAdmin: boolean, bookingId: string, dto: UpdateBookingStatusDto) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking");
    }

    if (!isAdmin && ownerIdOf(booking as unknown as PopulatedProvider) !== requesterId) {
      throw new ForbiddenError("You do not own the repair service behind this booking");
    }

    await this.bookingRepository.createStatusLog({
      booking: bookingId,
      stage: dto.stage as RepairStageType,
      note: dto.note,
      updatedBy: requesterId,
    });

    const updated = await this.bookingRepository.updateStage(
      bookingId,
      dto.stage as RepairStageType,
      statusForStage(dto.stage as RepairStageType)
    );

    return { booking: updated };
  }

  /**
   * Full stage history for a booking. Viewable by the customer who placed
   * it, the seller who owns the listing, or an admin.
   */
  async getStatusHistory(requesterId: string, isAdmin: boolean, bookingId: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking");
    }

    const isCustomer = booking.user.toString() === requesterId;
    const isOwner = ownerIdOf(booking as unknown as PopulatedProvider) === requesterId;
    if (!isAdmin && !isCustomer && !isOwner) {
      throw new ForbiddenError("You do not have access to this booking's history");
    }

    const logs = await this.bookingRepository.findStatusLogsByBooking(bookingId);
    return { logs };
  }
}
