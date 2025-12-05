import { z } from "zod";

export const subscribeToPremiumSchema = z.object({
  body: z.object({
    planType: z.enum(["monthly", "annual"], {
      message: "planType must be 'monthly' or 'annual'",
    }),
  }),
});

