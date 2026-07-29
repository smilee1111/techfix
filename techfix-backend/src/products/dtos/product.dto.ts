import { z } from "zod/v4";
import {
  AuthenticityLabel,
  AuthenticityLabelType,
  ProductCondition,
  ProductConditionType,
} from "../../config/constants";

// Typed tuples (not [string, ...string[]]) so z.infer produces the literal
// union rather than widening to string — the service consumes these values
// directly as ProductConditionType.
const conditionValues = Object.values(ProductCondition) as [
  ProductConditionType,
  ...ProductConditionType[],
];
const authenticityValues = Object.values(AuthenticityLabel) as [
  AuthenticityLabelType,
  ...AuthenticityLabelType[],
];

// ─── Search / List Products Query DTO ────────────────────────────
export const searchProductsDto = z.object({
  q: z.string().trim().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  condition: z.enum(conditionValues).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  city: z.string().optional(),
  inStockOnly: z.coerce.boolean().optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  sortBy: z.enum(["rating", "price", "newest"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

export type SearchProductsDto = z.infer<typeof searchProductsDto>;

// ─── Compare Products Query DTO ──────────────────────────────────
// Capped at 3 for the same reason repair comparison is: more than three
// columns exceeds what a user can hold in working memory (Miller's Law).
export const compareProductsDto = z.object({
  ids: z
    .string()
    .min(1, "ids query param is required")
    .transform((val) => val.split(",").map((id) => id.trim()))
    .refine((arr) => arr.length >= 2 && arr.length <= 3, {
      message: "Provide between 2 and 3 ids to compare",
    }),
});

export type CompareProductsDto = z.infer<typeof compareProductsDto>;

// ─── Create Product DTO (seller-facing) ──────────────────────────
const specDto = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

const authenticityCheckDto = z.object({
  label: z.string().min(1),
  passed: z.boolean().default(false),
});

export const createProductDto = z.object({
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  brand: z.string().min(1, "Brand is required"),
  modelName: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0),
  originalPrice: z.number().min(0).optional(),
  condition: z.enum(conditionValues).optional(),
  authenticityLabel: z.enum(authenticityValues).optional(),
  authenticityChecks: z.array(authenticityCheckDto).optional().default([]),
  certificateId: z.string().optional(),
  warranty: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string()).optional().default([]),
  specs: z.array(specDto).optional().default([]),
  compatibility: z.array(z.string()).optional().default([]),
  city: z.string().optional(),
});

export type CreateProductDto = z.infer<typeof createProductDto>;

// ─── Update Product DTO ──────────────────────────────────────────
// No defaults, for the same reason as the repair update DTO: omitting a
// key must leave the stored value alone, not reset it to an empty array.
export const updateProductDto = z
  .object({
    category: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    brand: z.string().min(1).optional(),
    modelName: z.string().optional(),
    description: z.string().min(1).optional(),
    price: z.number().min(0).optional(),
    originalPrice: z.number().min(0).optional(),
    condition: z.enum(conditionValues).optional(),
    authenticityLabel: z.enum(authenticityValues).optional(),
    authenticityChecks: z.array(authenticityCheckDto).optional(),
    certificateId: z.string().optional(),
    warranty: z.string().optional(),
    stock: z.number().int().min(0).optional(),
    images: z.array(z.string()).optional(),
    specs: z.array(specDto).optional(),
    compatibility: z.array(z.string()).optional(),
    city: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export type UpdateProductDto = z.infer<typeof updateProductDto>;

// ─── Activate / Verify DTOs ──────────────────────────────────────
export const setProductActiveDto = z.object({ isActive: z.boolean() });
export type SetProductActiveDto = z.infer<typeof setProductActiveDto>;

export const setProductVerifiedDto = z.object({ isVerified: z.boolean() });
export type SetProductVerifiedDto = z.infer<typeof setProductVerifiedDto>;
