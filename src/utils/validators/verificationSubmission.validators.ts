import { z } from "zod";

export const submitVerificationSchema = z.object({
  body: z.object({
    idCardImage: z.string().url("Invalid ID card image URL"),
    faceImage: z.string().url("Invalid face image URL"),
  }),
});

export type SubmitVerificationInput = z.infer<typeof submitVerificationSchema>["body"];

