import { Request, Response, NextFunction } from "express";

/**
 * Simple in-memory rate limiter.
 * Tracks request counts per IP within a sliding time window.
 *
 * For production, consider using Redis-backed rate limiting
 * (e.g., rate-limiter-flexible with Redis store).
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimiterOptions {
  windowMs?: number;  // Time window in milliseconds (default: 15 min)
  maxRequests?: number; // Max requests per window (default: 100)
  message?: string;
}

export const rateLimiter = (options: RateLimiterOptions = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = "Too many requests. Please try again later.",
  } = options;

  const store = new Map<string, RateLimitEntry>();

  // Cleanup expired entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      store.set(key, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      res.set("Retry-After", String(retryAfter));
      res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: retryAfter,
      });
      return;
    }

    entry.count++;
    next();
  };
};

// ─── Pre-configured limiters for auth routes ──────────────────
export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20,           // 20 login/register attempts per 15 min
  message: "Too many authentication attempts. Please try again after 15 minutes.",
});
