import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { listReviewsDto, createReviewDto } from "../dtos/review.dto";

const router = Router();
const reviewController = new ReviewController();

// GET /api/reviews?targetType=product&target=<id> — public
router.get("/", validate(listReviewsDto, "query"), reviewController.list);

// POST /api/reviews — leaving a review requires an account, so ratings
// trace back to a real user rather than anonymous traffic.
router.post("/", authenticate, validate(createReviewDto), reviewController.create);

export default router;
