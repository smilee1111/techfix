import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../auth/types/user.type";

/**
 * Upload Controller
 * Receives already-uploaded (by the upload.middleware Multer chain)
 * Cloudinary files and returns their URLs. No business logic beyond that.
 */
export class UploadController {
  repairPhotos = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      const urls = files.map((file) => file.path);

      res.status(201).json({ success: true, data: { urls } });
    } catch (error) {
      next(error);
    }
  };
}
