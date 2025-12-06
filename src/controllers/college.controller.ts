import { Request, Response, NextFunction } from "express";
import {
  createCollege,
  getAllColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
  getCollegesForSignup,
} from "../services/college.service";
import { AppError } from "../middleware/errorHandler";

export const createCollegeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const college = await createCollege(req.body, req.user.userId);
    res.status(201).json({
      success: true,
      message: "College created successfully",
      data: college,
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

export const getAllCollegesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const colleges = await getAllColleges();
    res.status(200).json({
      success: true,
      data: colleges,
    });
  } catch (error) {
    next(error);
  }
};

// Public endpoint for signup page
export const getCollegesForSignupHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const colleges = await getCollegesForSignup();
    res.status(200).json({
      success: true,
      data: colleges,
    });
  } catch (error) {
    next(error);
  }
};

export const getCollegeByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const college = await getCollegeById(id);
    res.status(200).json({
      success: true,
      data: college,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = 404;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const updateCollegeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const college = await updateCollege(id, req.body);
    res.status(200).json({
      success: true,
      message: "College updated successfully",
      data: college,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "College not found" ? 404 : 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const deleteCollegeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await deleteCollege(id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "College not found" ? 404 : 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

