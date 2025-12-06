import { Request, Response, NextFunction } from "express";
import { signupUser, loginUser, getUserById } from "../services/auth.service";
import { AppError } from "../middleware/errorHandler";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await signupUser(req.body);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result,
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

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("🔐 Login attempt for email:", req.body.email);
    const result = await loginUser(req.body);
    console.log("✅ Login successful for:", req.body.email);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    if (error instanceof Error) {
      const appError: AppError = new Error(error.message || "Invalid email or password");
      appError.statusCode = 401;
      next(appError);
    } else {
      const appError: AppError = new Error("Invalid email or password");
      appError.statusCode = 401;
      next(appError);
    }
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const user = await getUserById(req.user.userId);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = 401;
      next(appError);
    } else {
      next(error);
    }
  }
};

