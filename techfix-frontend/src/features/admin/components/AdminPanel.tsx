"use client";

import { useState } from "react";
import { useAdminCategories } from "@/features/admin/hooks/useAdminCategories";
import { useAdminUsers } from "@/features/admin/hooks/useAdminUsers";
import type { Category, CategoryType } from "@/features/categories/types/category.types";

type Tab = "categories" | "sellers";

const EMPTY_FORM = { name: "", type: "repair" as CategoryType, description: "" };

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * Admin panel — feature UI only.
 *
 * Covers the two admin capabilities the backend already enforced but had no
 * surface for: the category taxonomy that both listings and estimates are
 * built on, and the seller verified badge, which is the platform's primary
 * trust signal (App_info.md names trust as the core priority).
 */
export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("categories");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    isSubmitting,
    deletingId,
    save,
    remove,
    clearError,
  } = useAdminCategories();

  const {
    users: sellers,
    isLoading: sellersLoading,
    error: sellersError,
    updatingId,
    toggleSellerVerified,
  } = useAdminUsers("seller");

  function startEdit(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      type: category.type,
      description: category.description ?? "",
    });
    clearError();
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    clearError();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return;

    const ok = await save(
      {
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim() || undefined,
      },
      editingId ?? undefined,
    );

    if (ok) cancelEdit();
  }

  async function handleDelete(id: string) {
    // Two-step confirm: deleting a category orphans every listing that
    // references it, so it must not be a single misplaced click.
    if (confirmingId !== id) {
      setConfirmingId(id);
      return;
    }
    setConfirmingId(null);
    await remove(id);
  }

  return (
    <section className="dash" aria-labelledby="admin-heading">
      <div className="dash__head">
        <h1 id="admin-heading" className="dash__title">
          Admin Panel
        </h1>
        <p className="dash__subtitle">Manage the category taxonomy and seller verification.</p>
      </div>

      <div className="dash__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "categories"}
          className={`dash__tab ${tab === "categories" ? "dash__tab--active" : ""}`}
          onClick={() => setTab("categories")}
        >
          Categories
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "sellers"}
          className={`dash__tab ${tab === "sellers" ? "dash__tab--active" : ""}`}
          onClick={() => setTab("sellers")}
        >
          Sellers
        </button>
      </div>

      {tab === "categories" ? (
        <div className="dash__list">
          {categoriesError && (
            <div className="fp__error" role="alert">
              {categoriesError}
            </div>
          )}

          <form className="lform" onSubmit={handleSubmit}>
            <div className="lform__head">
              <h2 className="lform__title">{editingId ? "Edit Category" : "New Category"}</h2>
              <p className="lform__subtitle">
                Categories power both repair listings and the price estimator.
              </p>
            </div>

            <div className="lform__grid">
              <label className="lform__field">
                <span className="lform__label">Name</span>
                <input
                  className="lform__input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Smartphone Repair"
                />
              </label>

              <label className="lform__field">
                <span className="lform__label">Type</span>
                <select
                  className="lform__input"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as CategoryType })}
                  disabled={!!editingId}
                >
                  <option value="repair">Repair</option>
                  <option value="product">Product</option>
                </select>
              </label>

              <label className="lform__field lform__field--wide">
                <span className="lform__label">Description</span>
                <input
                  className="lform__input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional"
                />
              </label>
            </div>

            {editingId && (
              <p className="lform__hint">
                A category&apos;s type is fixed after creation — listings already reference it.
              </p>
            )}

            <div className="lform__actions">
              <button type="submit" className="lform__submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : editingId ? "Save Changes" : "Create Category"}
              </button>
              {editingId && (
                <button type="button" className="lform__cancel" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          {categoriesLoading ? (
            <p style={{ color: "var(--color-text-muted)" }}>Loading categories…</p>
          ) : categories.length === 0 ? (
            <p className="dash__empty">No categories yet — create the first one above.</p>
          ) : (
            categories.map((category) => (
              <div className="dash__card" key={category.id}>
                <div className="dash__card-avatar" aria-hidden>
                  {initials(category.name)}
                </div>
                <div className="dash__card-info">
                  <span className="dash__card-title">{category.name}</span>
                  <span className="dash__card-meta">
                    /{category.slug}
                    {category.description ? ` · ${category.description}` : ""}
                  </span>
                </div>
                <span className="dash__stage-badge">{category.type}</span>
                <button
                  type="button"
                  className="dash__card-view"
                  onClick={() => startEdit(category)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={`dash__card-view ${
                    confirmingId === category.id ? "dash__card-view--danger" : ""
                  }`}
                  disabled={deletingId === category.id}
                  onClick={() => handleDelete(category.id)}
                  onBlur={() => setConfirmingId(null)}
                >
                  {deletingId === category.id
                    ? "…"
                    : confirmingId === category.id
                      ? "Confirm?"
                      : "Delete"}
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="dash__list">
          {sellersError && (
            <div className="fp__error" role="alert">
              {sellersError}
            </div>
          )}

          {sellersLoading ? (
            <p style={{ color: "var(--color-text-muted)" }}>Loading sellers…</p>
          ) : sellers.length === 0 ? (
            <p className="dash__empty">No seller accounts yet.</p>
          ) : (
            sellers.map((seller) => (
              <div className="dash__card" key={seller.id}>
                <div className="dash__card-avatar" aria-hidden>
                  {initials(seller.name)}
                </div>
                <div className="dash__card-info">
                  <span className="dash__card-title">{seller.name}</span>
                  <span className="dash__card-meta">
                    {seller.email} · {seller.phone}
                  </span>
                </div>
                <span
                  className={
                    seller.isVerifiedSeller
                      ? "dash__stage-badge dash__stage-badge--delivered"
                      : "dash__stage-badge"
                  }
                >
                  {seller.isVerifiedSeller ? "Verified" : "Unverified"}
                </span>
                <button
                  type="button"
                  className="dash__card-view"
                  disabled={updatingId === seller.id}
                  onClick={() => toggleSellerVerified(seller)}
                >
                  {updatingId === seller.id
                    ? "…"
                    : seller.isVerifiedSeller
                      ? "Revoke"
                      : "Verify"}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
