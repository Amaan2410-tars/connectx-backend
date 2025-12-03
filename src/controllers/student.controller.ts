import { Request, Response, NextFunction } from "express";
import { getStudentsByCollege, getStudentStats } from "../services/student.service";
import { AppError } from "../middleware/errorHandler";
import prisma from "../config/prisma";

export const getStudentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    // Get collegeId from user (college admin)
    const admin = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { collegeId: true },
    });

    if (!admin || !admin.collegeId) {
      throw new Error("College admin must be associated with a college");
    }

    const students = await getStudentsByCollege(admin.collegeId);
    res.status(200).json({
      success: true,
      data: students,
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

export const getStudentStatsHandler = async (
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

    const stats = await getStudentStats(admin.collegeId);
    res.status(200).json({
      success: true,
      data: stats,
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

