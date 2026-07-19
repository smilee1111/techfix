import mongoose, { Schema, Document, Model } from "mongoose";
import { IEstimateMatch } from "../types/estimate.type";

export interface IEstimateDocument extends Document {
  _id: mongoose.Types.ObjectId;
  // Optional — getting an estimate is a low-friction discovery tool and
  // deliberately doesn't require login, matching public repair browsing.
  user?: mongoose.Types.ObjectId;
  brand: string;
  deviceModel: string;
  issueType: string;
  city: string;
  estimatedMin: number;
  estimatedMax: number;
  matchedShopsCount: number;
  topMatches: IEstimateMatch[];
  createdAt: Date;
  updatedAt: Date;
}

const estimateMatchSchema = new Schema(
  {
    repairService: { type: Schema.Types.ObjectId, ref: "RepairService", required: true },
    providerName: { type: String, required: true },
    price: { type: Number, required: true },
    averageRating: { type: Number, required: true },
  },
  { _id: false }
);

const estimateSchema = new Schema<IEstimateDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    brand: { type: String, required: true, trim: true },
    deviceModel: { type: String, required: true, trim: true },
    issueType: { type: String, required: true, trim: true },
    city: { type: String, required: true, default: "Kathmandu" },
    estimatedMin: { type: Number, required: true, default: 0 },
    estimatedMax: { type: Number, required: true, default: 0 },
    matchedShopsCount: { type: Number, required: true, default: 0 },
    topMatches: { type: [estimateMatchSchema], default: [] },
  },
  { timestamps: true }
);

estimateSchema.index({ user: 1, createdAt: -1 });

const Estimate: Model<IEstimateDocument> = mongoose.model<IEstimateDocument>(
  "Estimate",
  estimateSchema
);

export default Estimate;
