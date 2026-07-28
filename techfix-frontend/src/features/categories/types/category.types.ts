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
