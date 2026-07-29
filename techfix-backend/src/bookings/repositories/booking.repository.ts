import Booking, { IBookingDocument } from "../models/booking.model";
import RepairStatusLog, { IRepairStatusLogDocument } from "../models/repairStatusLog.model";
import { BookingStatusType, RepairStageType } from "../../config/constants";

const REPAIR_SERVICE_POPULATE = {
  path: "repairService",
  select: "title provider",
  populate: { path: "provider", select: "name" },
};

/**
 * Booking Repository
 * The only layer that talks to MongoDB for bookings and their status log.
 */
export class BookingRepository {
  async create(data: Partial<IBookingDocument>): Promise<IBookingDocument> {
    const booking = new Booking(data);
    return booking.save();
  }

  async findById(id: string): Promise<IBookingDocument | null> {
    return Booking.findById(id).populate(REPAIR_SERVICE_POPULATE).exec();
  }

  /** The logged-in customer's own bookings, newest first. */
  async findByUser(userId: string): Promise<IBookingDocument[]> {
    return Booking.find({ user: userId })
      .populate(REPAIR_SERVICE_POPULATE)
      .sort({ createdAt: -1 })
      .exec();
  }

  /** Incoming bookings for a seller's own repair-service listings. */
  async findByRepairServiceIds(repairServiceIds: string[]): Promise<IBookingDocument[]> {
    return Booking.find({ repairService: { $in: repairServiceIds } })
      .populate("user", "name email phone")
      .populate(REPAIR_SERVICE_POPULATE)
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStage(
    id: string,
    stage: RepairStageType,
    status: BookingStatusType
  ): Promise<IBookingDocument | null> {
    return Booking.findByIdAndUpdate(
      id,
      { currentStage: stage, status },
      { returnDocument: "after" }
    )
      .populate(REPAIR_SERVICE_POPULATE)
      .exec();
  }

  async referenceIdExists(referenceId: string): Promise<boolean> {
    const count = await Booking.countDocuments({ referenceId });
    return count > 0;
  }

  async createStatusLog(data: {
    booking: string;
    stage: RepairStageType;
    note?: string;
    updatedBy: string;
  }): Promise<IRepairStatusLogDocument> {
    const log = new RepairStatusLog(data);
    return log.save();
  }

  async findStatusLogsByBooking(bookingId: string): Promise<IRepairStatusLogDocument[]> {
    return RepairStatusLog.find({ booking: bookingId })
      .populate("updatedBy", "name")
      .sort({ timestamp: -1 })
      .exec();
  }
}
