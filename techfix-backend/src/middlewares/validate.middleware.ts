import { Request, Response, NextFunction } from "express";
import { z } from "zod/v4";

/**
 * Zod DTO validation middleware.
 * Applied at the route level to validate req.body, req.query, or req.params
 * before the request ever reaches a controller.
 *
 * Usage:
 *   validate(registerDto)            → validates req.body
 *   validate(searchDto, "query")     → validates req.query
 *   validate(idParamDto, "params")   → validates req.params
 */
export const validate = (
  schema: z.ZodType<any>,
  source: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    // Replace with parsed (coerced + defaulted) data
    req[source] = result.data;
    next();
  };
};
