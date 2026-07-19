import mongoose, { Schema, Document, Model } from "mongoose";
import { RepairStage, RepairStageType } from "../../config/constants";

export interface IRepairStatusLogDocument extends Document {
  _id: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  stage: RepairStageType;
  note?: string;
  updatedBy: mongoose.Types.ObjectId;
  timestamp: Date;
}

const repairStatusLogSchema = new Schema<IRepairStatusLogDocument>({
  booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
  stage: { type: String, enum: Object.values(RepairStage), required: true },
  note: { type: String },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
});

// Append-only: each transition is its own document, never mutated —
// gives a full audit trail and lets the timeline UI render history as-is.
repairStatusLogSchema.index({ booking: 1, timestamp: -1 });

const RepairStatusLog: Model<IRepairStatusLogDocument> =
  mongoose.model<IRepairStatusLogDocument>("RepairStatusLog", repairStatusLogSchema);

export default RepairStatusLog;
