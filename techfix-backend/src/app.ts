import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { registerRoutes } from "./routes/index";
import { errorHandler } from "./middlewares/errorHandler.middleware";

/**
 * Express app setup.
 * Registers global middleware, routes, and error handling.
 * Exported separately from the server start for testing purposes.
 */
const app = express();

// ─── Global Middleware ────────────────────────────────────────────

// CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true, // Allow cookies (refresh token)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser (for httpOnly refresh token cookies)
app.use(cookieParser());

// ─── Routes ──────────────────────────────────────────────────────
registerRoutes(app);

// ─── 404 handler for unmatched routes ────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─── Centralized error handler (must be last) ────────────────────
app.use(errorHandler);

export default app;
// Updated CORS origin config to allow localhost:3000
