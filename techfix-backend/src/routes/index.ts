import { Router, Application } from "express";
import authRoutes from "../auth/routes/auth.routes";
import categoryRoutes from "../categories/routes/category.routes";
import repairRoutes from "../repairs/routes/repair.routes";
import estimateRoutes from "../estimate/routes/estimate.routes";
import bookingRoutes from "../bookings/routes/booking.routes";
import uploadRoutes from "../uploads/upload.routes";
import productRoutes from "../products/routes/product.routes";
import reviewRoutes from "../reviews/routes/review.routes";


/**
 * Central route registry.
 * Registers all feature routers into the Express app.
 * Add new feature routes here as the app grows.
 */
export const registerRoutes = (app: Application): void => {
  const apiRouter = Router();

  // ─── Feature routes ─────────────────────────────────────────
  apiRouter.use("/auth", authRoutes);
  apiRouter.use("/categories", categoryRoutes);
  apiRouter.use("/repairs", repairRoutes);
  apiRouter.use("/estimates", estimateRoutes);
  apiRouter.use("/bookings", bookingRoutes);
  apiRouter.use("/uploads", uploadRoutes);
  apiRouter.use("/products", productRoutes);
  apiRouter.use("/reviews", reviewRoutes);

  // apiRouter.use("/orders", orderRoutes);      // TODO — sprint 6
  // apiRouter.use("/help", helpRoutes);         // TODO — sprint 6


  // ─── Health check ───────────────────────────────────────────
  apiRouter.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "TechFix API is running",
      timestamp: new Date().toISOString(),
    });
  });

  // Mount all routes under /api
  app.use("/api", apiRouter);
};
