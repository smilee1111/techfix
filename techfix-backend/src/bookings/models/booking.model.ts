import mongoose, { Schema, Document, Model } from "mongoose";
import {
  BookingType,
  BookingTypeType,
  BookingPaymentMethod,
  BookingPaymentMethodType,
  BookingStatus,
  BookingStatusType,
  RepairStage,
  RepairStageType,
} from "../../config/constants";

export interface IBookingDocument extends Document {
  _id: mongoose.Types.ObjectId;
  referenceId: string;
  user: mongoose.Types.ObjectId;
  repairService: mongoose.Types.ObjectId;
  repairOptionName: string;
  bookingType: BookingTypeType;
  pickupAddress?: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  issueDescription?: string;
  issuePhotos: string[];
  paymentMethod: BookingPaymentMethodType;
  subtotal: number;
  pickupDeliveryFee: number;
  serviceFee: number;
  total: number;
  status: BookingStatusType;
  // Denormalized snapshot of the latest RepairStatusLog entry, so reads
  // (the customer's "My Repairs" list, the seller's queue) never need to
  // join the log just to show the current stage.
  currentStage: RepairStageType;
  estimatedPickupDate: Date;
  dateBooked: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBookingDocument>(
  {
    referenceId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    repairService: { type: Schema.Types.ObjectId, ref: "RepairService", required: true },
    repairOptionName: { type: String, required: true },
    bookingType: {
      type: String,
      enum: Object.values(BookingType),
      required: true,
    },
    pickupAddress: { type: String },
    contactName: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, trim: true, lowercase: true },
    issueDescription: { type: String },
    issuePhotos: { type: [String], default: [] },
    paymentMethod: {
      type: String,
      enum: Object.values(BookingPaymentMethod),
      required: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    pickupDeliveryFee: { type: Number, required: true, default: 0, min: 0 },
    serviceFee: { type: Number, required: true, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    currentStage: {
      type: String,
      enum: Object.values(RepairStage),
      default: RepairStage.RECEIVED,
    },
    estimatedPickupDate: { type: Date, required: true },
    dateBooked: { type: Date, default: Date.now },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ repairService: 1, status: 1 });

const Booking: Model<IBookingDocument> = mongoose.model<IBookingDocument>(
  "Booking",
  bookingSchema
);

export default Booking;
