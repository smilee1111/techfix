import mongoose, { Schema, Document, Model } from "mongoose";
import {
  AuthenticityLabel,
  AuthenticityLabelType,
  ProductCondition,
  ProductConditionType,
} from "../../config/constants";
import { IProductSpec, IAuthenticityCheck } from "../types/product.type";

export interface IProductDocument extends Document {
  _id: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  title: string;
  brand: string;
  /** Named modelName, not model — `model` collides with Document.model(). */
  modelName?: string;
  description: string;
  price: number;
  /** Pre-discount price, shown struck through when higher than `price`. */
  originalPrice?: number;
  condition: ProductConditionType;
  authenticityLabel: AuthenticityLabelType;
  authenticityChecks: IAuthenticityCheck[];
  certificateId?: string;
  warranty?: string;
  stock: number;
  images: string[];
  specs: IProductSpec[];
  compatibility: string[];
  city: string;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const specSchema = new Schema<IProductSpec>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const authenticityCheckSchema = new Schema<IAuthenticityCheck>(
  {
    label: { type: String, required: true },
    passed: { type: Boolean, default: false },
  },
  { _id: false }
);

const productSchema = new Schema<IProductDocument>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    title: { type: String, required: [true, "Title is required"], trim: true },
    brand: { type: String, required: [true, "Brand is required"], trim: true },
    modelName: { type: String, trim: true },
    description: { type: String, required: [true, "Description is required"] },
    price: { type: Number, required: [true, "Price is required"], min: 0 },
    originalPrice: { type: Number, min: 0 },
    condition: {
      type: String,
      enum: Object.values(ProductCondition),
      default: ProductCondition.NEW,
    },
    authenticityLabel: {
      type: String,
      enum: Object.values(AuthenticityLabel),
      default: AuthenticityLabel.GENUINE,
    },
    authenticityChecks: { type: [authenticityCheckSchema], default: [] },
    certificateId: { type: String, trim: true },
    warranty: { type: String },
    stock: { type: Number, default: 0, min: 0 },
    images: { type: [String], default: [] },
    specs: { type: [specSchema], default: [] },
    compatibility: { type: [String], default: [] },
    city: { type: String, default: "Kathmandu", trim: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    // Admin-granted, same as RepairService.isVerified — never self-assigned.
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ seller: 1, isActive: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ title: "text", description: "text", brand: "text" });

const Product: Model<IProductDocument> = mongoose.model<IProductDocument>(
  "Product",
  productSchema
);

export default Product;
