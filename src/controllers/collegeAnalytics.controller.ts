import { Request, Response, NextFunction } from "express";
import { getCollegeAdminAnalytics } from "../services/collegeAnalytics.service";
import { AppError } from "../middleware/errorHandler";
import prisma from "../config/prisma";

export const getAnalyticsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const admin = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { collegeId: true },
    });

    if (!admin || !admin.collegeId) {
      throw new Error("College admin must be associated with a college");
    }

    const analytics = await getCollegeAdminAnalytics(admin.collegeId);
    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

