import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { env } from "../config/env";

/**
 * Centralized error handler.
 * Catches all errors thrown from services/controllers and formats them
 * into a consistent JSON response shape.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ── Known operational errors (thrown intentionally) ──────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(("errors" in err) && { errors: (err as any).errors }),
    });
    return;
  }

  // ── Mongoose duplicate key error ────────────────────────────
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || "field";
    res.status(409).json({
      success: false,
      message: `Duplicate value for '${field}'. This ${field} is already in use.`,
    });
    return;
  }

  // ── Mongoose validation error ───────────────────────────────
  if (err.name === "ValidationError") {
    const mongooseErr = err as any;
    const errors = Object.values(mongooseErr.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }

  // ── Multer upload errors (file too large, too many files, etc.) ─
  if (err.name === "MulterError") {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // ── JWT errors ──────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token has expired",
    });
    return;
  }

  // ── Unknown / unexpected errors ─────────────────────────────
  console.error("❌ Unhandled error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(env.isDev && { stack: err.stack }),
  });
};
