import mongoose, { Schema, Document, Model } from "mongoose";
import { ServiceOption, ServiceOptionType } from "../../config/constants";
import { IRepairLocation, IRepairOption, IPriceRange } from "../types/repair.type";

export interface IRepairServiceDocument extends Document {
  _id: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  deviceType: string;
  title: string;
  description: string;
  priceRange: IPriceRange;
  repairOptions: IRepairOption[];
  estimatedTime?: string;
  readyBy?: string;
  warranty?: string;
  images: string[];
  location: IRepairLocation;
  averageRating: number;
  totalReviews: number;
  serviceOptions: ServiceOptionType[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const repairOptionSchema = new Schema<IRepairOption>(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    estimatedTime: { type: String },
  },
  { _id: false }
);

const locationSchema = new Schema<IRepairLocation>(
  {
    address: { type: String, required: true },
    city: { type: String, required: true, default: "Kathmandu" },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: undefined,
      },
    },
  },
  { _id: false }
);

const repairServiceSchema = new Schema<IRepairServiceDocument>(
  {
    provider: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provider is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    deviceType: { type: String, required: [true, "Device type is required"], trim: true },
    title: { type: String, required: [true, "Title is required"], trim: true },
    description: { type: String, required: [true, "Description is required"] },
    priceRange: {
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 0 },
    },
    repairOptions: { type: [repairOptionSchema], default: [] },
    estimatedTime: { type: String },
    readyBy: { type: String },
    warranty: { type: String },
    images: { type: [String], default: [] },
    location: { type: locationSchema, required: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    serviceOptions: {
      type: [String],
      enum: Object.values(ServiceOption),
      default: [],
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

repairServiceSchema.index({ category: 1, isActive: 1 });
repairServiceSchema.index({ provider: 1, isActive: 1 });
repairServiceSchema.index({ deviceType: 1 });
repairServiceSchema.index({ title: "text", description: "text", deviceType: "text" });
repairServiceSchema.index({ "location.coordinates": "2dsphere" });

const RepairService: Model<IRepairServiceDocument> =
  mongoose.model<IRepairServiceDocument>("RepairService", repairServiceSchema);

export default RepairService;
