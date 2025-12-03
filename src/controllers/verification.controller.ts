import { Request, Response, NextFunction } from "express";
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} from "../services/verification.service";
import { AppError } from "../middleware/errorHandler";
import prisma from "../config/prisma";

export const getPendingVerificationsHandler = async (
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

    const verifications = await getPendingVerifications(admin.collegeId);
    res.status(200).json({
      success: true,
      data: verifications,
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

export const approveRejectVerificationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const { status } = req.body;

    let result;
    if (status === "approved") {
      result = await approveVerification(id, req.user.userId);
    } else if (status === "rejected") {
      result = await rejectVerification(id, req.user.userId);
    } else {
      throw new Error("Invalid status");
    }

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "Verification not found" ? 404 : 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

