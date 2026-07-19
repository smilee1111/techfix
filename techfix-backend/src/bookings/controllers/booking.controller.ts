import { Response, NextFunction } from "express";
import { BookingService } from "../services/booking.service";
import { AuthenticatedRequest } from "../../auth/types/user.type";
import { UserRole } from "../../config/constants";

/**
 * Booking Controller
 * Receives the HTTP request, passes clean data to the service,
 * sends the response back. Contains zero business logic.
 */
export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  create = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.bookingService.create(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: "Booking confirmed successfully",
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
      const result = await this.bookingService.getById(req.params.id as string);
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
      const result = await this.bookingService.getMine(req.user!.userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getIncoming = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.bookingService.getIncoming(req.user!.userId);
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
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const result = await this.bookingService.updateStatus(
        req.user!.userId,
        isAdmin,
        req.params.id as string,
        req.body
      );
      res.status(200).json({
        success: true,
        message: "Booking status updated successfully",
        data: result,
      });
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
      const result = await this.bookingService.getStatusHistory(
        req.user!.userId,
        isAdmin,
        req.params.id as string
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
