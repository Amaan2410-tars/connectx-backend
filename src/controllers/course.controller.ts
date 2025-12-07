import { Request, Response, NextFunction } from "express";
import { getCoursesByCollege, createCourse } from "../services/course.service";
import { AppError } from "../middleware/errorHandler";

export const getCoursesByCollegeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { collegeId } = req.params;
    
    if (!collegeId) {
      throw new Error("College ID is required");
    }

    const courses = await getCoursesByCollege(collegeId);
    res.status(200).json({
      success: true,
      data: courses,
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

export const createCourseHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const course = await createCourse(req.body);
    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
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


