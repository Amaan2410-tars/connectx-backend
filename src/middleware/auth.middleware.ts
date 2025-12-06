import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}
const FALLBACK_SECRET = "connectx_jwt_secret_dev_only"; // Only for development

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
      const secret = JWT_SECRET || FALLBACK_SECRET;
      const decoded = jwt.verify(token, secret) as AuthPayload;
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

// Middleware to check if student is fully verified
export const verifiedStudentOnly = async (
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

    if (req.user.role !== "student") {
      const error: AppError = new Error("Student access required");
      error.statusCode = 403;
      return next(error);
    }

    // Check verification status using raw query to handle missing columns gracefully
    const prisma = (await import("../config/prisma")).default;
    
    // Use raw query to handle potential schema mismatches
    const userResult = await prisma.$queryRaw<Array<{
      emailVerified: boolean | null;
      phoneVerified: boolean | null;
      verifiedStatus: string | null;
      bypassVerified: boolean | null;
    }>>`
      SELECT 
        "emailVerified",
        "phoneVerified",
        "verifiedStatus",
        "bypassVerified"
      FROM "User"
      WHERE id = ${req.user.userId}
      LIMIT 1
    `;

    if (!userResult || userResult.length === 0) {
      const error: AppError = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const user = userResult[0];

    // Check if user is fully verified
    const isVerified =
      (user.emailVerified === true) &&
      (user.phoneVerified === true) &&
      (user.verifiedStatus === "approved" || user.bypassVerified === true);

    if (!isVerified) {
      const error: AppError = new Error(
        "Account verification required. Please complete email, phone, and identity verification."
      );
      error.statusCode = 403;
      return next(error);
    }

    next();
  } catch (error) {
    next(error);
  }
};

