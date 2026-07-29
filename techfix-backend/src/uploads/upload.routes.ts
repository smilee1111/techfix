import { Router } from "express";
import { UploadController } from "./upload.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireCloudinaryConfigured, uploadRepairPhotos } from "./upload.middleware";

const router = Router();
const uploadController = new UploadController();

// POST /api/uploads/repair-photos — multipart/form-data, field name "photos"
router.post(
  "/repair-photos",
  authenticate,
  requireCloudinaryConfigured,
  uploadRepairPhotos,
  uploadController.repairPhotos
);

export default router;
