"use client";

import { useState } from "react";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useListingMutations } from "@/features/repairs/hooks/useListingMutations";
import {
  SERVICE_OPTIONS,
  type RepairListing,
  type RepairOption,
} from "@/features/repairs/types/repair.types";

interface ListingFormProps {
  /** Present in edit mode; omitted when creating. */
  listing?: RepairListing;
  onCancel: () => void;
  onSaved: () => void;
}

interface FormState {
  title: string;
  deviceType: string;
  description: string;
  category: string;
  priceMin: string;
  priceMax: string;
  estimatedTime: string;
  warranty: string;
  readyBy: string;
  address: string;
  city: string;
  serviceOptions: string[];
  repairOptions: RepairOption[];
}

const EMPTY_OPTION: RepairOption = { name: "", price: 0, description: "", estimatedTime: "" };

function initialState(listing?: RepairListing): FormState {
  return {
    title: listing?.title ?? "",
    deviceType: listing?.deviceType ?? "",
    description: listing?.description ?? "",
    category: listing?.category.id ?? "",
    priceMin: listing ? String(listing.priceRange.min) : "",
    priceMax: listing ? String(listing.priceRange.max) : "",
    estimatedTime: listing?.estimatedTime ?? "",
    warranty: listing?.warranty ?? "",
    readyBy: listing?.readyBy ?? "",
    address: listing?.location.address ?? "",
    city: listing?.location.city ?? "Kathmandu",
    serviceOptions: listing?.serviceOptions ?? [],
    repairOptions: listing?.repairOptions.length
      ? listing.repairOptions.map((o) => ({ ...o }))
      : [{ ...EMPTY_OPTION }],
  };
}

/**
 * Create / edit form for a seller's repair listing — feature UI only.
 *
 * Validates before submitting rather than letting the server reject
 * (Error Prevention); the backend re-validates every field via its Zod DTO
 * regardless, so this is a convenience layer, not the security boundary.
 */
export default function ListingForm({ listing, onCancel, onSaved }: ListingFormProps) {
  const isEdit = !!listing;
  const [form, setForm] = useState<FormState>(() => initialState(listing));
  const [validationError, setValidationError] = useState<string | null>(null);
  const { categories, isLoading: categoriesLoading } = useCategories("repair");
  const { save, isSubmitting, error, clearError } = useListingMutations();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setOption(index: number, patch: Partial<RepairOption>) {
    setForm((prev) => ({
      ...prev,
      repairOptions: prev.repairOptions.map((o, i) => (i === index ? { ...o, ...patch } : o)),
    }));
  }

  function addOption() {
    setForm((prev) => ({ ...prev, repairOptions: [...prev.repairOptions, { ...EMPTY_OPTION }] }));
  }

  function removeOption(index: number) {
    setForm((prev) => ({
      ...prev,
      repairOptions: prev.repairOptions.filter((_, i) => i !== index),
    }));
  }

  function toggleServiceOption(value: string) {
    setForm((prev) => ({
      ...prev,
      serviceOptions: prev.serviceOptions.includes(value)
        ? prev.serviceOptions.filter((v) => v !== value)
        : [...prev.serviceOptions, value],
    }));
  }

  function validate(): string | null {
    if (!form.title.trim()) return "Title is required";
    if (!form.deviceType.trim()) return "Device type is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.category) return "Please choose a category";
    if (!form.address.trim()) return "Address is required";

    const min = Number(form.priceMin);
    const max = Number(form.priceMax);
    if (!form.priceMin || !form.priceMax || Number.isNaN(min) || Number.isNaN(max)) {
      return "Enter both a minimum and maximum price";
    }
    if (min < 0 || max < 0) return "Prices cannot be negative";
    if (min > max) return "Minimum price cannot exceed maximum price";

    const filled = form.repairOptions.filter((o) => o.name.trim());
    if (filled.length === 0) {
      // Without at least one option there is nothing for a customer to book.
      return "Add at least one repair option";
    }
    if (filled.some((o) => Number.isNaN(Number(o.price)) || Number(o.price) < 0)) {
      return "Every repair option needs a valid price";
    }
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    clearError();

    const problem = validate();
    setValidationError(problem);
    if (problem) return;

    const ok = await save(
      {
        title: form.title.trim(),
        deviceType: form.deviceType.trim(),
        description: form.description.trim(),
        category: form.category,
        priceRange: { min: Number(form.priceMin), max: Number(form.priceMax) },
        repairOptions: form.repairOptions
          .filter((o) => o.name.trim())
          .map((o) => ({
            name: o.name.trim(),
            price: Number(o.price),
            description: o.description?.trim() || undefined,
            estimatedTime: o.estimatedTime?.trim() || undefined,
          })),
        estimatedTime: form.estimatedTime.trim() || undefined,
        warranty: form.warranty.trim() || undefined,
        readyBy: form.readyBy.trim() || undefined,
        location: { address: form.address.trim(), city: form.city.trim() || "Kathmandu" },
        serviceOptions: form.serviceOptions,
      },
      listing?.id,
    );

    if (ok) onSaved();
  }

  const message = validationError ?? error;

  return (
    <form className="lform" onSubmit={handleSubmit} noValidate>
      <div className="lform__head">
        <h2 className="lform__title">{isEdit ? "Edit Listing" : "New Listing"}</h2>
        <p className="lform__subtitle">
          {isEdit
            ? "Update the details customers see on your listing."
            : "Describe the repair service you offer."}
        </p>
      </div>

      {message && (
        <div className="fp__error" role="alert">
          {message}
        </div>
      )}

      <div className="lform__grid">
        <label className="lform__field">
          <span className="lform__label">Title</span>
          <input
            className="lform__input"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="iPhone Screen Repair"
          />
        </label>

        <label className="lform__field">
          <span className="lform__label">Device type</span>
          <input
            className="lform__input"
            value={form.deviceType}
            onChange={(e) => set("deviceType", e.target.value)}
            placeholder="Smartphone"
          />
        </label>

        <label className="lform__field">
          <span className="lform__label">Category</span>
          <select
            className="lform__input"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            disabled={categoriesLoading}
          >
            <option value="">
              {categoriesLoading ? "Loading categories…" : "Select a category"}
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="lform__field">
          <span className="lform__label">City</span>
          <input
            className="lform__input"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </label>

        <label className="lform__field lform__field--wide">
          <span className="lform__label">Address</span>
          <input
            className="lform__input"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Putalisadak, Kathmandu"
          />
        </label>

        <label className="lform__field lform__field--wide">
          <span className="lform__label">Description</span>
          <textarea
            className="lform__input lform__textarea"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="What you repair, turnaround time, parts you use…"
          />
        </label>

        <label className="lform__field">
          <span className="lform__label">Price from ($)</span>
          <input
            className="lform__input"
            type="number"
            min="0"
            value={form.priceMin}
            onChange={(e) => set("priceMin", e.target.value)}
          />
        </label>

        <label className="lform__field">
          <span className="lform__label">Price to ($)</span>
          <input
            className="lform__input"
            type="number"
            min="0"
            value={form.priceMax}
            onChange={(e) => set("priceMax", e.target.value)}
          />
        </label>

        <label className="lform__field">
          <span className="lform__label">Estimated time</span>
          <input
            className="lform__input"
            value={form.estimatedTime}
            onChange={(e) => set("estimatedTime", e.target.value)}
            placeholder="2–3 hours"
          />
        </label>

        <label className="lform__field">
          <span className="lform__label">Warranty</span>
          <input
            className="lform__input"
            value={form.warranty}
            onChange={(e) => set("warranty", e.target.value)}
            placeholder="90 days"
          />
        </label>

        <label className="lform__field">
          <span className="lform__label">Ready by</span>
          <input
            className="lform__input"
            value={form.readyBy}
            onChange={(e) => set("readyBy", e.target.value)}
            placeholder="Today, 6 PM"
          />
        </label>
      </div>

      <fieldset className="lform__fieldset">
        <legend className="lform__label">Service options</legend>
        <div className="lform__checks">
          {SERVICE_OPTIONS.map((opt) => (
            <label className="lform__check" key={opt.value}>
              <input
                type="checkbox"
                checked={form.serviceOptions.includes(opt.value)}
                onChange={() => toggleServiceOption(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="lform__fieldset">
        <legend className="lform__label">Repair options</legend>
        <p className="lform__hint">
          Each option is separately bookable — customers pick one of these at checkout.
        </p>

        <div className="lform__options">
          {form.repairOptions.map((option, index) => (
            <div className="lform__option" key={index}>
              <input
                className="lform__input"
                value={option.name}
                onChange={(e) => setOption(index, { name: e.target.value })}
                placeholder="Screen Replacement"
                aria-label={`Repair option ${index + 1} name`}
              />
              <input
                className="lform__input lform__input--price"
                type="number"
                min="0"
                value={option.price}
                onChange={(e) => setOption(index, { price: Number(e.target.value) })}
                placeholder="Price"
                aria-label={`Repair option ${index + 1} price`}
              />
              <input
                className="lform__input"
                value={option.estimatedTime ?? ""}
                onChange={(e) => setOption(index, { estimatedTime: e.target.value })}
                placeholder="1 hour"
                aria-label={`Repair option ${index + 1} estimated time`}
              />
              <button
                type="button"
                className="lform__remove"
                onClick={() => removeOption(index)}
                disabled={form.repairOptions.length === 1}
                aria-label={`Remove repair option ${index + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button type="button" className="lform__add" onClick={addOption}>
          + Add another option
        </button>
      </fieldset>

      <div className="lform__actions">
        <button type="submit" className="lform__submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Listing"}
        </button>
        <button type="button" className="lform__cancel" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
