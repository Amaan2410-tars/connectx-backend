import { Request, Response, NextFunction } from "express";
import {
  getEvents,
  getEventById,
  rsvpEvent,
  cancelRSVP,
} from "../services/studentEvent.service";
import { AppError } from "../middleware/errorHandler";
import prisma from "../config/prisma";

export const getEventsHandler = async (
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

    const events = await getEvents(user.collegeId);
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

export const rsvpEventHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const result = await rsvpEvent(req.user.userId, id);
    res.status(200).json({
      success: true,
      message: result.message,
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

export const cancelRSVPHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const result = await cancelRSVP(req.user.userId, id);
    res.status(200).json({
      success: true,
      message: result.message,
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

