import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    batch: z.string().optional(),
    avatar: z.string().url("Invalid avatar URL").optional(),
    banner: z.string().url("Invalid banner URL").optional(),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];

