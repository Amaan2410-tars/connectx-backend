import { Request, Response, NextFunction } from "express";
import {
  getClubs,
  getClubById,
  joinClub,
  leaveClub,
} from "../services/studentClub.service";
import { AppError } from "../middleware/errorHandler";
import prisma from "../config/prisma";

export const getClubsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { collegeId: true },
    });

    if (!user || !user.collegeId) {
      throw new Error("User must be associated with a college");
    }

    const clubs = await getClubs(user.collegeId);
    res.status(200).json({
      success: true,
      data: clubs,
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

export const getClubByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const club = await getClubById(id);
    res.status(200).json({
      success: true,
      data: club,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "Club not found" ? 404 : 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const joinClubHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const result = await joinClub(req.user.userId, id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "Club not found" ? 404 : 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const leaveClubHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const result = await leaveClub(req.user.userId, id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "Club not found" ? 404 : 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

