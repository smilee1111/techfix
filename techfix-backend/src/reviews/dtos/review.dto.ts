import { z } from "zod/v4";
import { ReviewTarget } from "../models/review.model";

const targetValues = Object.values(ReviewTarget) as [string, ...string[]];

// ─── List Reviews Query DTO ──────────────────────────────────────
export const listReviewsDto = z.object({
  targetType: z.enum(targetValues),
  target: z.string().min(1, "target id is required"),
});

export type ListReviewsDto = z.infer<typeof listReviewsDto>;

// ─── Create Review DTO ───────────────────────────────────────────
export const createReviewDto = z.object({
  targetType: z.enum(targetValues),
  target: z.string().min(1, "target id is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export type CreateReviewDto = z.infer<typeof createReviewDto>;
