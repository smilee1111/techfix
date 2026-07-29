import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary";

/**
 * Must run BEFORE the Multer/Cloudinary middleware below — Cloudinary's SDK
 * throws an opaque config error the moment a file upload is attempted if
 * it was never configured, so we short-circuit with a clear message first.
 */
export function requireCloudinaryConfigured(_req: Request, res: Response, next: NextFunction): void {
  if (!isCloudinaryConfigured) {
    res.status(503).json({
      success: false,
      message:
        "Photo upload isn't configured yet. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the backend .env.",
    });
    return;
  }
  next();
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "techfix/repair-issues",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  }),
});

/**
 * Multer middleware for repair-issue photo uploads. Only reached once
 * requireCloudinaryConfigured has already confirmed the SDK is set up.
 */
export const uploadRepairPhotos = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
}).array("photos", 6);
