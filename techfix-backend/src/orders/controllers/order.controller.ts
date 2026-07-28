import { Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { AuthenticatedRequest } from "../../auth/types/user.type";
import { UserRole } from "../../config/constants";

/**
 * Order Controller
 * Receives the HTTP request, passes clean data to the service,
 * sends the response back. Contains zero business logic.
 */
export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  create = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.orderService.create(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: result,
      });
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
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const result = await this.orderService.getById(
        req.user!.userId,
        isAdmin,
        req.params.id as string
      );
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
      const result = await this.orderService.getMine(req.user!.userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getStatusHistory = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const result = await this.orderService.getStatusHistory(
        req.user!.userId,
        isAdmin,
        req.params.id as string
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.orderService.updateStatus(
        req.user!.userId,
        req.user!.role,
        req.params.id as string,
        req.body
      );
      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
