import { Router, Application } from "express";
import authRoutes from "../auth/routes/auth.routes";
import categoryRoutes from "../categories/routes/category.routes";
import repairRoutes from "../repairs/routes/repair.routes";


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

  // apiRouter.use("/products", productRoutes);  // TODO
  // apiRouter.use("/bookings", bookingRoutes);  // TODO
  // apiRouter.use("/orders", orderRoutes);      // TODO
  // apiRouter.use("/estimates", estimateRoutes);// TODO
  // apiRouter.use("/help", helpRoutes);         // TODO


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
