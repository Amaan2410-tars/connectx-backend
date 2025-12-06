import { Request, Response, NextFunction } from "express";
import { createClub, getClubsByCollege, getClubById, updateClub, deleteClub, getMyClubs, removeMember } from "../services/club.service";
import { AppError } from "../middleware/errorHandler";
import prisma from "../config/prisma";

export const createClubHandler = async (
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

    const club = await createClub(req.body, admin.collegeId);
    res.status(201).json({
      success: true,
      message: "Club created successfully",
      data: club,
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

export const getClubsHandler = async (
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

    const clubs = await getClubsByCollege(admin.collegeId);
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

