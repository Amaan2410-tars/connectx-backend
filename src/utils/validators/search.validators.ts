import { z } from "zod";

export const searchSchema = z.object({
  query: z.object({
    q: z.string().min(1, "Search query is required").max(100, "Search query too long"),
    type: z.enum(["users", "posts", "clubs", "events", "all"]).optional(),
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
    cursor: z.string().optional(),
  }),
});

export type SearchInput = z.infer<typeof searchSchema>["query"];

