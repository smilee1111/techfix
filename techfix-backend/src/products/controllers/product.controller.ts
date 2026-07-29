import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import { AuthenticatedRequest } from "../../auth/types/user.type";
import { CompareProductsDto } from "../dtos/product.dto";
import { UserRole } from "../../config/constants";

/**
 * Product Controller
 * Receives the HTTP request, passes clean data to the service,
 * sends the response back. Contains zero business logic.
 */
export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.productService.search(req.query as never);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.productService.getById(req.params.id as string);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  compare = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ids } = req.query as unknown as CompareProductsDto;
      const result = await this.productService.compare(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  listBrands = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.productService.listBrands();
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
      const result = await this.productService.getMine(req.user!.userId);
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
      const result = await this.productService.create(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: "Product listed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const result = await this.productService.update(
        req.user!.userId,
        isAdmin,
        req.params.id as string,
        req.body
      );
      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  setActive = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const { isActive } = req.body as { isActive: boolean };
      const result = await this.productService.setActive(
        req.user!.userId,
        isAdmin,
        req.params.id as string,
        isActive
      );
      res.status(200).json({
        success: true,
        message: isActive ? "Product listed" : "Product hidden",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  setVerified = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { isVerified } = req.body as { isVerified: boolean };
      const result = await this.productService.setVerified(
        req.params.id as string,
        isVerified
      );
      res.status(200).json({
        success: true,
        message: isVerified ? "Product verified" : "Product verification removed",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
