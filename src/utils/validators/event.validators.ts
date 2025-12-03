import { z } from "zod";

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().optional(),
    date: z.string().datetime("Invalid date format").or(z.date()),
    image: z.string().url("Invalid image URL").optional(),
  }),
});

export const eventParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Event ID is required"),
  }),
});

export type CreateEventInput = z.infer<typeof createEventSchema>["body"];

