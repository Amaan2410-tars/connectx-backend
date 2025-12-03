import { z } from "zod";

export const createClubSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Club name must be at least 2 characters"),
    description: z.string().optional(),
    adminId: z.string().optional(), // student who will be admin
  }),
});

export const clubParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Club ID is required"),
  }),
});

export type CreateClubInput = z.infer<typeof createClubSchema>["body"];

