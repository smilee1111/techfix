import mongoose, { Schema, Document, Model } from "mongoose";

/** What a review is attached to. Kept generic so one collection serves both marketplace halves. */
export const ReviewTarget = {
  PRODUCT: "product",
  REPAIR_SERVICE: "repair_service",
} as const;
export type ReviewTargetType = (typeof ReviewTarget)[keyof typeof ReviewTarget];

export interface IReviewDocument extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  targetType: ReviewTargetType;
  /**
   * Points at either a Product or a RepairService. Mongoose `refPath`
   * isn't used because the two models live in different feature modules
   * and the repository always knows which one it is querying.
   */
  target: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: {
      type: String,
      enum: Object.values(ReviewTarget),
      required: true,
    },
    target: { type: Schema.Types.ObjectId, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

// One review per user per target — enforced in the database rather than
// only in the service, so a double-submit can't create duplicates.
reviewSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });
reviewSchema.index({ targetType: 1, target: 1, createdAt: -1 });

const Review: Model<IReviewDocument> = mongoose.model<IReviewDocument>(
  "Review",
  reviewSchema
);

export default Review;
