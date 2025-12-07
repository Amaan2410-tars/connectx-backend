import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { AppError } from "./errorHandler";

/**
 * Middleware to check if user is admin of a specific club
 */
export const clubAdminOnly = (req: Request, res: Response, next: NextFunction) => {
  const clubId = req.params.id || req.body.clubId;
  
  if (!clubId) {
    const error: AppError = new Error("Club ID is required") as AppError;
    error.statusCode = 400;
    return next(error);
  }

  if (!req.user) {
    const error: AppError = new Error("User not authenticated") as AppError;
    error.statusCode = 401;
    return next(error);
  }

  // Check if user is club admin
  prisma.club
    .findUnique({
      where: { id: clubId },
      select: { adminId: true },
    })
    .then((club) => {
      if (!club) {
        const error: AppError = new Error("Club not found") as AppError;
        error.statusCode = 404;
        return next(error);
      }

      if (club.adminId !== req.user!.userId) {
        const error: AppError = new Error("Only club admin can perform this action") as AppError;
        error.statusCode = 403;
        return next(error);
      }

      next();
    })
    .catch((err) => next(err));
};


