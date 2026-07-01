import { z } from "zod/v4";
import { UserRole } from "../../config/constants";

// ─── Shared phone regex (Nepali format) ─────────────────────────
const phoneRegex = /^\+977-?\d{10}$/;

// ─── Register DTO ───────────────────────────────────────────────
export const registerDto = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  phone: z
    .string()
    .regex(phoneRegex, "Phone must be in Nepali format: +977-XXXXXXXXXX"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
  role: z
    .enum(Object.values(UserRole) as [string, ...string[]])
    .optional()
    .default(UserRole.CUSTOMER),
});

export type RegisterDto = z.infer<typeof registerDto>;

// ─── Login DTO ──────────────────────────────────────────────────
export const loginDto = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export type LoginDto = z.infer<typeof loginDto>;

// ─── Refresh Token DTO ──────────────────────────────────────────
export const refreshTokenDto = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshTokenDto = z.infer<typeof refreshTokenDto>;

// ─── Update Profile DTO ─────────────────────────────────────────
export const updateProfileDto = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim()
    .optional(),
  phone: z
    .string()
    .regex(phoneRegex, "Phone must be in Nepali format: +977-XXXXXXXXXX")
    .optional(),
  avatar: z.string().url("Avatar must be a valid URL").optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileDto>;

// ─── Change Password DTO ────────────────────────────────────────
export const changePasswordDto = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(128, "New password must not exceed 128 characters"),
});

export type ChangePasswordDto = z.infer<typeof changePasswordDto>;

// ─── Add Address DTO ────────────────────────────────────────────
export const addAddressDto = z.object({
  label: z.string().min(1, "Label is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required").default("Kathmandu"),
  district: z.string().min(1, "District is required"),
  province: z.string().optional(),
  landmark: z.string().optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  isDefault: z.boolean().optional().default(false),
});

export type AddAddressDto = z.infer<typeof addAddressDto>;
