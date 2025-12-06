import { Request, Response, NextFunction } from "express";
import { createAnnouncement, getAnnouncements } from "../services/announcement.service";
import { AppError } from "../middleware/errorHandler";
import prisma from "../config/prisma";

export const createAnnouncementHandler = async (
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

    const { title, message } = req.body;

    if (!title || !message) {
      throw new Error("Title and message are required");
    }

    const announcement = await createAnnouncement(
      admin.collegeId,
      title,
      message,
      req.user.userId
    );

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcement,
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

export const getAnnouncementsHandler = async (
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

    const announcements = await getAnnouncements(admin.collegeId);
    res.status(200).json({
      success: true,
      data: announcements,
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

export const getStudentAnnouncementsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const student = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { collegeId: true },
    });

    if (!student || !student.collegeId) {
      throw new Error("Student must be associated with a college");
    }

    const announcements = await getAnnouncements(student.collegeId);
    res.status(200).json({
      success: true,
      data: announcements,
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

