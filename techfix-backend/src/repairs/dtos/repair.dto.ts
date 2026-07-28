import { z } from "zod/v4";
import { ServiceOption } from "../../config/constants";

// ─── Search / List Repair Services Query DTO ────────────────────
export const searchRepairsDto = z.object({
  q: z.string().trim().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  maxDistanceKm: z.coerce.number().positive().optional(),
  warrantyOnly: z.coerce.boolean().optional(),
  serviceType: z.enum(["pickup", "dropoff", "both"]).optional(),
  sortBy: z.enum(["closest", "rating", "price"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type SearchRepairsDto = z.infer<typeof searchRepairsDto>;

// ─── Compare Repair Services Query DTO ──────────────────────────
export const compareRepairsDto = z.object({
  ids: z
    .string()
    .min(1, "ids query param is required")
    .transform((val) => val.split(",").map((id) => id.trim()))
    .refine((arr) => arr.length >= 2 && arr.length <= 3, {
      message: "Provide between 2 and 3 ids to compare",
    }),
});

export type CompareRepairsDto = z.infer<typeof compareRepairsDto>;

// ─── Create Repair Service DTO (provider-facing) ─────────────────
const repairOptionDto = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  estimatedTime: z.string().optional(),
});

export const createRepairServiceDto = z.object({
  category: z.string().min(1, "Category is required"),
  deviceType: z.string().min(1, "Device type is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }),
  repairOptions: z.array(repairOptionDto).optional().default([]),
  estimatedTime: z.string().optional(),
  readyBy: z.string().optional(),
  warranty: z.string().optional(),
  images: z.array(z.string()).optional().default([]),
  location: z.object({
    address: z.string().min(1),
    city: z.string().default("Kathmandu"),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
  }),
  serviceOptions: z
    .array(z.enum(Object.values(ServiceOption) as [string, ...string[]]))
    .optional()
    .default([]),
});

export type CreateRepairServiceDto = z.infer<typeof createRepairServiceDto>;

// ─── Update Repair Service DTO (provider-facing) ─────────────────
// Every field is optional and — unlike the create DTO — none carry defaults,
// so omitting a key leaves the stored value untouched rather than resetting
// it to an empty array. `.refine` guards against an empty PATCH body.
export const updateRepairServiceDto = z
  .object({
    category: z.string().min(1).optional(),
    deviceType: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    priceRange: z
      .object({
        min: z.number().min(0),
        max: z.number().min(0),
      })
      .optional(),
    repairOptions: z.array(repairOptionDto).optional(),
    estimatedTime: z.string().optional(),
    readyBy: z.string().optional(),
    warranty: z.string().optional(),
    images: z.array(z.string()).optional(),
    location: z
      .object({
        address: z.string().min(1),
        city: z.string().optional(),
        coordinates: z
          .object({
            lat: z.number(),
            lng: z.number(),
          })
          .optional(),
      })
      .optional(),
    serviceOptions: z
      .array(z.enum(Object.values(ServiceOption) as [string, ...string[]]))
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export type UpdateRepairServiceDto = z.infer<typeof updateRepairServiceDto>;

// ─── Activate / Deactivate DTO ───────────────────────────────────
// Listings are soft-deleted: a seller deactivates rather than destroys, so
// existing bookings keep resolving their repairService reference.
export const setRepairServiceActiveDto = z.object({
  isActive: z.boolean(),
});

export type SetRepairServiceActiveDto = z.infer<typeof setRepairServiceActiveDto>;

// ─── Admin: Verify Listing DTO ───────────────────────────────────
// The verified badge is a trust signal, so it is admin-granted only —
// never settable by the seller who owns the listing.
export const setRepairServiceVerifiedDto = z.object({
  isVerified: z.boolean(),
});

export type SetRepairServiceVerifiedDto = z.infer<typeof setRepairServiceVerifiedDto>;
