import mongoose, { Schema, Document, Model } from "mongoose";
import {
  OrderStatus,
  OrderStatusType,
  PaymentMethod,
  PaymentMethodType,
} from "../../config/constants";

/**
 * A purchased line. Title, brand and unit price are snapshotted at order
 * time rather than referenced live — the same rule Booking applies to its
 * price fields, so a seller editing or withdrawing a product later never
 * rewrites what a customer already paid.
 */
export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  title: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  image?: string;
  sellerName: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  postalCode?: string;
  landmark?: string;
}

export interface IOrderDocument extends Document {
  _id: mongoose.Types.ObjectId;
  referenceId: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethodType;
  subtotal: number;
  shippingFee: number;
  total: number;
  /**
   * Doubles as the fulfilment stage — see OrderStatus in constants.ts.
   * Unlike Booking, there is no separate currentStage field: the ladder and
   * the coarse status are the same vocabulary here, so splitting them would
   * only create two things to keep in sync.
   */
  status: OrderStatusType;
  estimatedDeliveryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    brand: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
    sellerName: { type: String, required: true },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, default: "Kathmandu" },
    postalCode: { type: String, trim: true },
    landmark: { type: String, trim: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDocument>(
  {
    referenceId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PLACED,
    },
    estimatedDeliveryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "items.product": 1 });

const Order: Model<IOrderDocument> = mongoose.model<IOrderDocument>("Order", orderSchema);

export default Order;
