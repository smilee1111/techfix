import { Response, NextFunction } from "express";
import { EstimateService } from "../services/estimate.service";
import { AuthenticatedRequest } from "../../auth/types/user.type";

/**
 * Estimate Controller
 * Receives the HTTP request, passes clean data to the service,
 * sends the response back. Contains zero business logic.
 */
export class EstimateController {
  private estimateService: EstimateService;

  constructor() {
    this.estimateService = new EstimateService();
  }

  create = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.estimateService.create(req.user?.userId, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.estimateService.getById(req.params.id as string);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
