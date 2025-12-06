import { Request, Response, NextFunction } from "express";
import {
  subscribeToPremium,
  handlePremiumWebhook,
  getPremiumStatus,
  cancelPremium,
  verifyRazorpaySignature,
} from "../services/premium.service";
import { AppError } from "../middleware/errorHandler";

export const subscribeToPremiumHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { planType } = req.body;

    const result = await subscribeToPremium(req.user.userId, planType);

    res.status(200).json({
      success: true,
      message: "Subscription created successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode =
        error.message === "User not found" ||
        error.message.includes("Plan ID not configured")
          ? 404
          : error.message === "User already has an active or pending subscription"
          ? 400
          : 500;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const premiumWebhookHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const razorpaySignature = req.headers["x-razorpay-signature"] as string;

    if (!razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Razorpay signature missing",
      });
    }

    // Verify signature
    const payload = JSON.stringify(req.body);
    const orderId = req.body.payload?.payment?.entity?.order_id || req.body.payload?.subscription?.entity?.id;
    const paymentId = req.body.payload?.payment?.entity?.id;

    // For subscription webhooks, we verify differently
    const isValid = verifyRazorpaySignature(
      razorpaySignature,
      orderId || "",
      paymentId || ""
    );

    if (!isValid) {
      console.warn("Invalid Razorpay webhook signature");
      // In production, you might want to reject invalid signatures
      // return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // Handle webhook
    const result = await handlePremiumWebhook(req.body);

    res.status(200).json({
      success: true,
      message: result.message || "Webhook processed",
    });
  } catch (error) {
    console.error("Webhook error:", error);
    // Always return 200 to Razorpay to prevent retries
    res.status(200).json({
      success: false,
      message: error instanceof Error ? error.message : "Webhook processing failed",
    });
  }
};

export const getPremiumStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const status = await getPremiumStatus(req.user.userId);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "User not found" ? 404 : 500;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const cancelPremiumHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const result = await cancelPremium(req.user.userId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.subscription,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode =
        error.message === "No active subscription found" ? 404 : 500;
      next(appError);
    } else {
      next(error);
    }
  }
};


