import { Request, Response, NextFunction } from "express";
import { createEvent, getEventsByCollege, getEventById } from "../services/event.service";
import { AppError } from "../middleware/errorHandler";
import prisma from "../config/prisma";
import { processUploadedFile } from "../services/fileUpload.service";

export const createEventHandler = async (
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

    // Check if image was uploaded
    let imageUrl = req.body.image;
    if (req.file) {
      const uploadedFile = processUploadedFile(req.file);
      imageUrl = uploadedFile.url;
    }

    const event = await createEvent({
      ...req.body,
      image: imageUrl,
    }, admin.collegeId);
    
    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
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

export const getEventsHandler = async (
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

    const events = await getEventsByCollege(admin.collegeId);
    res.status(200).json({
      success: true,
      data: events,
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

export const getEventByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const event = await getEventById(id);
    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "Event not found" ? 404 : 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

