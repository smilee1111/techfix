import { ENDPOINTS } from "@/lib/endpoints";
import type {
  Category,
  CategoryInput,
  CategoryType,
} from "@/features/categories/types/category.types";

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

/** Admin only — the backend gates every write below on the admin role. */
export async function createCategory(
  accessToken: string,
  input: CategoryInput,
): Promise<Category> {
  const response = await fetch(ENDPOINTS.categories.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  });
  const result = await parseOrThrow(response, "Could not create category");
  return mapCategory(result.data.category);
}

/**
 * Note the verb: the backend exposes PUT (not PATCH) for categories, and
 * its update DTO deliberately omits `type` — a category's side of the
 * taxonomy is fixed once listings reference it.
 */
export async function updateCategory(
  accessToken: string,
  id: string,
  input: Partial<Omit<CategoryInput, "type">>,
): Promise<Category> {
  const response = await fetch(ENDPOINTS.categories.update(id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  });
  const result = await parseOrThrow(response, "Could not update category");
  return mapCategory(result.data.category);
}

export async function deleteCategory(accessToken: string, id: string): Promise<void> {
  const response = await fetch(ENDPOINTS.categories.remove(id), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await parseOrThrow(response, "Could not delete category");
}
