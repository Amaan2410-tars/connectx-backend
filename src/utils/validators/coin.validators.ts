import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    bundleId: z.number().int().positive("Bundle ID must be a positive integer"),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string().min(1, "Order ID is required"),
    razorpay_payment_id: z.string().min(1, "Payment ID is required"),
    razorpay_signature: z.string().min(1, "Signature is required"),
  }),
});

export const giftCoinsSchema = z.object({
  body: z.object({
    toUserId: z.string().min(1, "Recipient user ID is required"),
    coins: z.number().int().positive("Coins must be a positive integer"),
  }),
});


