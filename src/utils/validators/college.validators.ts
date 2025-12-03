import { z } from "zod";

export const createCollegeSchema = z.object({
  body: z.object({
    name: z.string().min(2, "College name must be at least 2 characters"),
    slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    logo: z.string().url("Invalid logo URL").optional(),
    city: z.string().optional(),
    website: z.string().url("Invalid website URL").optional(),
  }),
});

export const updateCollegeSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
    logo: z.string().url().optional(),
    city: z.string().optional(),
    website: z.string().url().optional(),
  }),
  params: z.object({
    id: z.string().min(1, "College ID is required"),
  }),
});

export const collegeParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "College ID is required"),
  }),
});

export type CreateCollegeInput = z.infer<typeof createCollegeSchema>["body"];
export type UpdateCollegeInput = z.infer<typeof updateCollegeSchema>["body"];

