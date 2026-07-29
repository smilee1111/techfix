import { z } from "zod/v4";

export const createEstimateDto = z.object({
  brand: z.string().min(1, "Brand is required"),
  deviceModel: z.string().min(1, "Device model is required"),
  issueType: z.string().min(1, "Issue type is required"),
  city: z.string().min(1).default("Kathmandu"),
});

export type CreateEstimateDto = z.infer<typeof createEstimateDto>;
