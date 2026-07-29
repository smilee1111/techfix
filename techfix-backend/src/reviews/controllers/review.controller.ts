import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/review.service";
import { AuthenticatedRequest } from "../../auth/types/user.type";

/**
 * Review Controller
 * Receives the HTTP request, passes clean data to the service,
 * sends the response back. Contains zero business logic.
 */
export class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.reviewService.list(req.query as never);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.reviewService.create(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
