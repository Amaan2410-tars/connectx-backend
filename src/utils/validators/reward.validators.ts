import { z } from "zod";

export const rewardParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Reward ID is required"),
  }),
});

export const couponParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Coupon ID is required"),
  }),
});

