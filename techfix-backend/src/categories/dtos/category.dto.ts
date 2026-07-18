import { z } from "zod/v4";
import { CategoryType, CategoryTypeType } from "../../config/constants";

const categoryTypeValues = Object.values(CategoryType) as [
  CategoryTypeType,
  ...CategoryTypeType[]
];

// ─── Create Category DTO ─────────────────────────────────────────
export const createCategoryDto = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  type: z.enum(categoryTypeValues),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  parent: z.string().optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategoryDto>;

// ─── Update Category DTO ─────────────────────────────────────────
export const updateCategoryDto = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  parent: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateCategoryDto = z.infer<typeof updateCategoryDto>;

// ─── List Categories Query DTO ───────────────────────────────────
export const listCategoriesDto = z.object({
  type: z.enum(categoryTypeValues).optional(),
});

export type ListCategoriesDto = z.infer<typeof listCategoriesDto>;
