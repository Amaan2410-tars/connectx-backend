import { z } from "zod";

export const createCollegeAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    collegeId: z.string().min(1, "College ID is required"),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
});

export const deletePostSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Post ID is required"),
  }),
});

export type CreateCollegeAdminInput = z.infer<typeof createCollegeAdminSchema>["body"];

