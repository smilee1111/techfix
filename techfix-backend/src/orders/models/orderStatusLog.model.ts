import mongoose, { Schema, Document, Model } from "mongoose";
import { OrderStatus, OrderStatusType } from "../../config/constants";

export interface IOrderStatusLogDocument extends Document {
  _id: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  stage: OrderStatusType;
  note?: string;
  updatedBy: mongoose.Types.ObjectId;
  timestamp: Date;
}

const orderStatusLogSchema = new Schema<IOrderStatusLogDocument>({
  order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  stage: { type: String, enum: Object.values(OrderStatus), required: true },
  note: { type: String },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
});

// Append-only, exactly like RepairStatusLog — each transition is its own
// document, so the order tracking UI can reuse the repair timeline logic.
orderStatusLogSchema.index({ order: 1, timestamp: -1 });

const OrderStatusLog: Model<IOrderStatusLogDocument> =
  mongoose.model<IOrderStatusLogDocument>("OrderStatusLog", orderStatusLogSchema);

export default OrderStatusLog;
