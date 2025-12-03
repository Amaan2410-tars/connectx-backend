import { z } from "zod";

export const approveRejectVerificationSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Verification ID is required"),
  }),
  body: z.object({
    status: z.enum(["approved", "rejected"], {
      message: "Status must be either 'approved' or 'rejected'",
    }),
  }),
});

export const verificationParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Verification ID is required"),
  }),
});

