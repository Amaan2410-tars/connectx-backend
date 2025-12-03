import { Request, Response, NextFunction } from "express";
import {
  getRewards,
  getRewardById,
  redeemReward,
  getCoupons,
  getCouponById,
  redeemCoupon,
} from "../services/reward.service";
import { AppError } from "../middleware/errorHandler";

export const getRewardsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rewards = await getRewards();
    res.status(200).json({
      success: true,
      data: rewards,
    });
  } catch (error) {
    next(error);
  }
};

export const getRewardByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const reward = await getRewardById(id);
    res.status(200).json({
      success: true,
      data: reward,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "Reward not found" ? 404 : 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const redeemRewardHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const result = await redeemReward(req.user.userId, id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        remainingPoints: result.remainingPoints,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "Reward not found" ? 404 : 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const getCouponsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const coupons = await getCoupons(userId);
    res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

export const getCouponByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const coupon = await getCouponById(id);
    res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "Coupon not found" ? 404 : 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const redeemCouponHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const result = await redeemCoupon(req.user.userId, id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.coupon,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "Coupon not found" ? 404 : 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

