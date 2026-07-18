import "dotenv/config";
import { z } from "zod/v4";

/**
 * Environment variable validation.
 * Fails fast at startup if required variables are missing or malformed,
 * instead of surfacing confusing errors deep in a request handler.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  // Trim a trailing slash — the browser's Origin header never has one, so
  // "http://localhost:3000/" vs "http://localhost:3000" fails CORS's exact
  // string match and silently blocks every request.
  CORS_ORIGIN: z
    .string()
    .min(1)
    .default("http://localhost:3000")
    .transform((val) => val.replace(/\/+$/, "")),

  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  RESET_PASSWORD_SECRET: z.string().min(1).optional(),
  RESET_PASSWORD_EXPIRES_IN: z.string().default("30m"),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default("TechFix <no-reply@techfix.com>"),

  FRONTEND_URL: z
    .string()
    .default("http://localhost:3000")
    .transform((val) => val.replace(/\/+$/, "")),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  for (const issue of parsed.error.issues) {
    console.error(`   ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isDev: parsed.data.NODE_ENV === "development",
  isProd: parsed.data.NODE_ENV === "production",
  isTest: parsed.data.NODE_ENV === "test",
  // Falls back to the access secret so reset tokens work without extra setup;
  // override with a distinct RESET_PASSWORD_SECRET in production.
  RESET_PASSWORD_SECRET: parsed.data.RESET_PASSWORD_SECRET ?? parsed.data.JWT_ACCESS_SECRET,
};
