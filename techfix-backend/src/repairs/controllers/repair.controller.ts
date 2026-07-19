import { Response, NextFunction } from "express";
import { RepairService } from "../services/repair.service";
import { AuthenticatedRequest } from "../../auth/types/user.type";
import { CompareRepairsDto } from "../dtos/repair.dto";

/**
 * Repair Controller
 * Receives the HTTP request, passes clean data to the service,
 * sends the response back. Contains zero business logic.
 */
export class RepairController {
  private repairService: RepairService;

  constructor() {
    this.repairService = new RepairService();
  }

  search = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.repairService.search(req.query as any);
      res.status(200).json({ success: true, data: result });
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
      const result = await this.repairService.getById(req.params.id as string);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getMine = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.repairService.getMine(req.user!.userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  compare = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { ids } = req.query as unknown as CompareRepairsDto;
      const result = await this.repairService.compare(ids);
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
      const result = await this.repairService.create(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: "Repair service listing created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
