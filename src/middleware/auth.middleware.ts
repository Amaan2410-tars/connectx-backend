import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "connectx_jwt_secret";

export interface AuthPayload {
  userId: string;
  role: Role;
}

export const authRequired = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error: AppError = new Error("No token provided");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
      };
      next();
    } catch (jwtError) {
      const error: AppError = new Error("Invalid or expired token");
      error.statusCode = 401;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const superAdminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    const error: AppError = new Error("Authentication required");
    error.statusCode = 401;
    return next(error);
  }

  if (req.user.role !== "super_admin") {
    const error: AppError = new Error("Super admin access required");
    error.statusCode = 403;
    return next(error);
  }

  next();
};

export const collegeAdminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    const error: AppError = new Error("Authentication required");
    error.statusCode = 401;
    return next(error);
  }

  if (req.user.role !== "college_admin" && req.user.role !== "super_admin") {
    const error: AppError = new Error("College admin access required");
    error.statusCode = 403;
    return next(error);
  }

  next();
};

export const studentOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    const error: AppError = new Error("Authentication required");
    error.statusCode = 401;
    return next(error);
  }

  if (req.user.role !== "student") {
    const error: AppError = new Error("Student access required");
    error.statusCode = 403;
    return next(error);
  }

  next();
};

