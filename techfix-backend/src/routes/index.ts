import { Router, Application } from "express";


/**
 * Central route registry.
 * Registers all feature routers into the Express app.
 * Add new feature routes here as the app grows.
 */
export const registerRoutes = (app: Application): void => {
  const apiRouter = Router();

  // ─── Feature routes ─────────────────────────────────────────

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
