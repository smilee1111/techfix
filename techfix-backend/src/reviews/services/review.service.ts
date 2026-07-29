import { ReviewRepository } from "../repositories/review.repository";
import { ProductRepository } from "../../products/repositories/product.repository";
import { CreateReviewDto, ListReviewsDto } from "../dtos/review.dto";
import { ReviewTarget, ReviewTargetType } from "../models/review.model";
import { ConflictError } from "../../errors/ConflictError";

/**
 * Review Service
 *
 * Owns the rating lifecycle: a review is written, then the target's
 * denormalised rating snapshot is recomputed. Products and repair
 * listings both carry averageRating/totalReviews so list views never
 * have to join this collection just to draw stars.
 */
export class ReviewService {
  private reviewRepository: ReviewRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
    this.productRepository = new ProductRepository();
  }

  async list(dto: ListReviewsDto) {
    const reviews = await this.reviewRepository.findByTarget(
      dto.targetType as ReviewTargetType,
      dto.target
    );
    return { reviews };
  }

  async create(userId: string, dto: CreateReviewDto) {
    const targetType = dto.targetType as ReviewTargetType;

    // The unique index is the real guard; this check exists to return a
    // readable 409 instead of a raw duplicate-key error.
    const existing = await this.reviewRepository.findOneByUser(
      userId,
      targetType,
      dto.target
    );
    if (existing) {
      throw new ConflictError("You have already reviewed this");
    }

    const review = await this.reviewRepository.create({
      user: userId,
      targetType,
      target: dto.target,
      rating: dto.rating,
      comment: dto.comment,
    });

    await this.refreshRatingSummary(targetType, dto.target);

    return { review };
  }

  /**
   * Recomputes and stores the target's rating snapshot.
   * Only products are handled today — repair listings currently carry
   * seeded ratings, and wiring them up is a follow-on task.
   */
  private async refreshRatingSummary(targetType: ReviewTargetType, target: string) {
    const { averageRating, totalReviews } = await this.reviewRepository.aggregateRating(
      targetType,
      target
    );

    if (targetType === ReviewTarget.PRODUCT) {
      await this.productRepository.setRatingSummary(target, averageRating, totalReviews);
    }
  }
}
