import { Request, Response, NextFunction } from "express";
import {
  createCollegeAdmin,
  deleteUser,
  deletePost,
  getAllCollegeAdmins,
} from "../services/admin.service";
import { getSuperAdminAnalytics } from "../services/analytics.service";
import { AppError } from "../middleware/errorHandler";

export const createCollegeAdminHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const admin = await createCollegeAdmin(req.body);
    res.status(201).json({
      success: true,
      message: "College admin created successfully",
      data: admin,
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

export const deleteUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await deleteUser(id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "User not found" ? 404 : 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const deletePostHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await deletePost(id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "Post not found" ? 404 : 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const getAnalyticsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const analytics = await getSuperAdminAnalytics();
    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCollegeAdminsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const admins = await getAllCollegeAdmins();
    res.status(200).json({
      success: true,
      data: admins,
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

