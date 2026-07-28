export type CategoryType = "product" | "repair";

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  description?: string;
  icon?: string;
  parent?: string;
}

/**
 * Request body for creating a category. `slug` is absent by design — the
 * backend generates it from the name.
 */
export interface CategoryInput {
  name: string;
  type: CategoryType;
  description?: string;
  icon?: string;
}
