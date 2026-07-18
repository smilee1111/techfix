import mongoose, { Schema, Document, Model } from "mongoose";
import { CategoryType, CategoryTypeType } from "../../config/constants";

export interface ICategoryDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  type: CategoryTypeType;
  description?: string;
  icon?: string;
  parent?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(CategoryType),
      required: [true, "Type is required"],
    },
    description: { type: String, trim: true },
    icon: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Auto-generate slug from name if not provided ───────────────
categorySchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

// Note: slug already gets a unique index from `unique: true` in the schema
// field above — declaring it again here caused Mongoose's duplicate-index warning.
categorySchema.index({ type: 1, isActive: 1 });

const Category: Model<ICategoryDocument> = mongoose.model<ICategoryDocument>(
  "Category",
  categorySchema
);

export default Category;
