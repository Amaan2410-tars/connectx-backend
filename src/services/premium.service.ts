import prisma from "../config/prisma";
import crypto from "crypto";

// Razorpay configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const RAZORPAY_MONTHLY_PLAN_ID = process.env.RAZORPAY_PREMIUM_MONTHLY_PLAN_ID || "";
const RAZORPAY_ANNUAL_PLAN_ID = process.env.RAZORPAY_PREMIUM_ANNUAL_PLAN_ID || "";

// Dummy Razorpay client for now (replace with actual Razorpay SDK)
interface RazorpaySubscription {
  id: string;
  status: string;
  current_start: number;
  current_end: number;
  plan_id: string;
}

// Helper function to create Razorpay subscription (dummy implementation)
const createRazorpaySubscription = async (
  planId: string,
  customerId: string,
  totalCount: number
): Promise<RazorpaySubscription> => {
  // TODO: Replace with actual Razorpay SDK
  // const Razorpay = require("razorpay");
  // const razorpay = new Razorpay({
  //   key_id: RAZORPAY_KEY_ID,
  //   key_secret: RAZORPAY_KEY_SECRET,
  // });
  
  // const subscription = await razorpay.subscriptions.create({
  //   plan_id: planId,
  //   customer_notify: 1,
  //   total_count: totalCount,
  //   start_at: Math.floor(Date.now() / 1000),
  // });

  // Dummy implementation
  const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Math.floor(Date.now() / 1000);
  const periodEnd = planId === RAZORPAY_MONTHLY_PLAN_ID 
    ? now + 30 * 24 * 60 * 60 // 30 days
    : now + 365 * 24 * 60 * 60; // 365 days

  return {
    id: subscriptionId,
    status: "created",
    current_start: now,
    current_end: periodEnd,
    plan_id: planId,
  };
};

// Helper function to verify Razorpay webhook signature
export const verifyRazorpaySignature = (
  razorpaySignature: string,
  razorpayOrderId: string,
  razorpayPaymentId: string
): boolean => {
  if (!RAZORPAY_KEY_SECRET) {
    console.warn("RAZORPAY_KEY_SECRET not set, skipping signature verification");
    return true; // Allow in development
  }

  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest("hex");

  return expectedSignature === razorpaySignature;
};

// Subscribe to premium
export const subscribeToPremium = async (
  userId: string,
  planType: "monthly" | "annual"
) => {
  // Get plan ID based on plan type
  const planId =
    planType === "monthly" ? RAZORPAY_MONTHLY_PLAN_ID : RAZORPAY_ANNUAL_PLAN_ID;

  if (!planId) {
    throw new Error(`Plan ID not configured for ${planType} plan`);
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user already has an active subscription
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: ["active", "pending"],
      },
    },
  });

  if (existingSubscription) {
    throw new Error("User already has an active or pending subscription");
  }

  // Create Razorpay subscription
  const totalCount = planType === "monthly" ? 12 : 1;
  const razorpaySubscription = await createRazorpaySubscription(
    planId,
    userId,
    totalCount
  );

  // Save subscription in database
  const subscription = await prisma.subscription.create({
    data: {
      userId,
      razorpaySubId: razorpaySubscription.id,
      razorpayPlanId: planId,
      planType,
      status: "pending",
      currentPeriodEnd: new Date(razorpaySubscription.current_end * 1000),
    },
  });

  return {
    subscription,
    razorpaySubscription: {
      id: razorpaySubscription.id,
      status: razorpaySubscription.status,
    },
  };
};

// Handle Razorpay webhook
export const handlePremiumWebhook = async (payload: any) => {
  const event = payload.event;
  const subscriptionData = payload.payload.subscription?.entity || payload.payload.subscription;

  if (!subscriptionData || !subscriptionData.id) {
    throw new Error("Invalid webhook payload: subscription data missing");
  }

  const razorpaySubId = subscriptionData.id;

  // Find subscription in database
  const subscription = await prisma.subscription.findUnique({
    where: { razorpaySubId },
    include: { user: true },
  });

  if (!subscription) {
    console.warn(`Subscription not found: ${razorpaySubId}`);
    return { message: "Subscription not found" };
  }

  // Handle different events
  switch (event) {
    case "subscription.activated":
    case "subscription.charged": {
      const currentEnd = subscriptionData.current_end
        ? new Date(subscriptionData.current_end * 1000)
        : new Date(Date.now() + (subscription.planType === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000);

      // Update subscription
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "active",
          currentPeriodEnd: currentEnd,
        },
      });

      // Update user premium status
      await prisma.user.update({
        where: { id: subscription.userId },
        data: {
          isPremium: true,
          premiumPlan: subscription.planType,
          premiumBadge: "premium",
          premiumExpiry: currentEnd,
        },
      });

      return { message: "Subscription activated", subscription };
    }

    case "subscription.completed": {
      // Subscription completed - check if it should renew or expire
      const now = new Date();
      if (subscription.currentPeriodEnd < now) {
        // Expired
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "expired" },
        });

        await prisma.user.update({
          where: { id: subscription.userId },
          data: {
            isPremium: false,
            premiumPlan: null,
            premiumBadge: null,
            premiumExpiry: null,
          },
        });
      }

      return { message: "Subscription completed", subscription };
    }

    case "subscription.cancelled": {
      // Update subscription status but keep premium until expiry
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
      });

      // Don't revoke premium immediately - let it expire naturally
      return { message: "Subscription cancelled", subscription };
    }

    default:
      return { message: `Event ${event} not handled` };
  }
};

// Get premium status
export const getPremiumStatus = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPremium: true,
      premiumPlan: true,
      premiumBadge: true,
      premiumExpiry: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();
  const daysRemaining = user.premiumExpiry
    ? Math.max(0, Math.ceil((user.premiumExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // If premium expired, update user status
  if (user.isPremium && user.premiumExpiry && user.premiumExpiry < now) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: false,
        premiumPlan: null,
        premiumBadge: null,
        premiumExpiry: null,
      },
    });

    return {
      isPremium: false,
      premiumPlan: null,
      premiumBadge: null,
      premiumExpiry: null,
      daysRemaining: 0,
    };
  }

  return {
    isPremium: user.isPremium,
    premiumPlan: user.premiumPlan,
    premiumBadge: user.premiumBadge,
    premiumExpiry: user.premiumExpiry,
    daysRemaining,
  };
};

// Cancel premium subscription
export const cancelPremium = async (userId: string) => {
  // Find active subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: ["active", "pending"],
      },
    },
  });

  if (!subscription) {
    throw new Error("No active subscription found");
  }

  // TODO: Call Razorpay API to cancel subscription
  // const Razorpay = require("razorpay");
  // const razorpay = new Razorpay({
  //   key_id: RAZORPAY_KEY_ID,
  //   key_secret: RAZORPAY_KEY_SECRET,
  // });
  // await razorpay.subscriptions.cancel(subscription.razorpaySubId);

  // Update subscription status
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
    },
  });

  // Don't revoke premium immediately - keep until expiry
  return {
    message: "Subscription cancelled successfully. Premium access will continue until expiry.",
    subscription,
  };
};


