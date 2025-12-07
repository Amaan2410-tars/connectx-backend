import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";
import prisma from "../config/prisma";

export const premiumOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      const error: AppError = new Error("Authentication required");
      error.statusCode = 401;
      return next(error);
    }

    // Fetch latest user data from database to check premium status
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        isPremium: true,
        premiumExpiry: true,
      },
    });

    if (!user) {
      const error: AppError = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const now = new Date();

    // Check if user has premium and it hasn't expired
    if (!user.isPremium || !user.premiumExpiry || user.premiumExpiry < now) {
      // Auto-update expired premium status
      if (user.isPremium && user.premiumExpiry && user.premiumExpiry < now) {
        await prisma.user.update({
          where: { id: req.user.userId },
          data: {
            isPremium: false,
            premiumPlan: null,
            premiumBadge: null,
            premiumExpiry: null,
          },
        });
      }

      return res.status(403).json({
        success: false,
        message: "Premium membership required",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};



