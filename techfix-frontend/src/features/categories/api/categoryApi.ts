import { ENDPOINTS } from "@/lib/endpoints";
import type { Category, CategoryType } from "@/features/categories/types/category.types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapCategory(raw: any): Category {
  return {
    id: raw._id,
    name: raw.name,
    slug: raw.slug,
    type: raw.type,
    description: raw.description,
    icon: raw.icon,
    parent: raw.parent?._id ?? raw.parent,
  };
}

async function parseOrThrow(response: Response, fallback: string) {
  const result = await response.json().catch(() => ({ message: fallback }));
  if (!response.ok) {
    throw new Error(result.message ?? fallback);
  }
  return result;
}

/**
 * Lists active categories, optionally narrowed to one side of the taxonomy.
 * Public endpoint — no token required.
 * All raw API calls are centralised here — never call fetch from components.
 */
export async function getCategories(type?: CategoryType): Promise<Category[]> {
  const url = type ? ENDPOINTS.categories.byType(type) : ENDPOINTS.categories.list;
  const response = await fetch(url);
  const result = await parseOrThrow(response, "Could not load categories");
  return (result.data.categories ?? []).map(mapCategory);
}
