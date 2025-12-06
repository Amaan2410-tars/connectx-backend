import { Request, Response, NextFunction } from "express";
import {
  getCoinBundles,
  createOrder,
  verifyPayment,
  giftCoins,
  getTransactionHistory,
} from "../services/coin.service";
import { AppError } from "../middleware/errorHandler";

export const getCoinBundlesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bundles = await getCoinBundles();
    res.status(200).json({
      success: true,
      data: bundles,
    });
  } catch (error) {
    next(error);
  }
};

export const createOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { bundleId } = req.body;
    const result = await createOrder(req.user.userId, bundleId);

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "Bundle not found" ? 404 : 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const verifyPaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const result = await verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.purchase,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode =
        error.message === "Purchase not found" ||
        error.message === "Invalid payment signature"
          ? 400
          : 500;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const giftCoinsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { toUserId, coins } = req.body;

    if (req.user.userId === toUserId) {
      throw new Error("Cannot gift coins to yourself");
    }

    const result = await giftCoins(req.user.userId, toUserId, coins);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.transaction,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode =
        error.message === "Recipient user not found" ||
        error.message === "Sender user not found"
          ? 404
          : error.message === "Insufficient coins" ||
            error.message === "Cannot gift coins to yourself"
          ? 400
          : 500;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const getTransactionHistoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const transactions = await getTransactionHistory(req.user.userId);

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};


