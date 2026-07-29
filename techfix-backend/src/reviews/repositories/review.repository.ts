import mongoose from "mongoose";
import Review, { IReviewDocument, ReviewTargetType } from "../models/review.model";

/**
 * Review Repository
 * The only layer that talks to MongoDB for reviews.
 */
export class ReviewRepository {
  async create(data: {
    user: string;
    targetType: ReviewTargetType;
    target: string;
    rating: number;
    comment?: string;
  }): Promise<IReviewDocument> {
    const review = new Review(data);
    return review.save();
  }

  async findByTarget(
    targetType: ReviewTargetType,
    target: string
  ): Promise<IReviewDocument[]> {
    return Review.find({ targetType, target })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOneByUser(
    userId: string,
    targetType: ReviewTargetType,
    target: string
  ): Promise<IReviewDocument | null> {
    return Review.findOne({ user: userId, targetType, target }).exec();
  }

  /**
   * Recomputes the rating summary from the reviews themselves rather than
   * incrementing a counter — a running average drifts if a write is ever
   * lost or replayed, and this collection is small enough to aggregate.
   */
  async aggregateRating(
    targetType: ReviewTargetType,
    target: string
  ): Promise<{ averageRating: number; totalReviews: number }> {
    const [summary] = await Review.aggregate<{
      averageRating: number;
      totalReviews: number;
    }>([
      { $match: { targetType, target: new mongoose.Types.ObjectId(target) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (!summary) return { averageRating: 0, totalReviews: 0 };

    return {
      averageRating: Math.round(summary.averageRating * 10) / 10,
      totalReviews: summary.totalReviews,
    };
  }
}
