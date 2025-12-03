import { z } from "zod";

export const createPostSchema = z.object({
  body: z.object({
    caption: z.string().optional(),
    image: z.string().url("Invalid image URL").optional(),
  }),
});

export const postParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Post ID is required"),
  }),
});

export const commentSchema = z.object({
  body: z.object({
    text: z.string().min(1, "Comment text is required"),
  }),
  params: z.object({
    id: z.string().min(1, "Post ID is required"),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>["body"];

