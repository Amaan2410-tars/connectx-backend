import { Request, Response, NextFunction } from "express";
import {
  searchUsers,
  searchPosts,
  searchClubs,
  searchEvents,
  searchAll,
} from "../services/search.service";
import { AppError } from "../middleware/errorHandler";
import prisma from "../config/prisma";

export const searchHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { q, type = "all", limit = 20, cursor } = req.query;

    if (!q || typeof q !== "string") {
      throw new Error("Search query is required");
    }

    // Get user's collegeId if they're a student
    let collegeId: string | undefined;
    if (req.user.role === "student") {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { collegeId: true },
      });
      collegeId = user?.collegeId || undefined;
    }

    const searchLimit = typeof limit === "string" ? parseInt(limit) : limit;
    const searchCursor = typeof cursor === "string" ? cursor : undefined;

    let result;

    switch (type) {
      case "users":
        result = await searchUsers(q, searchLimit, searchCursor, collegeId);
        break;
      case "posts":
        result = await searchPosts(q, searchLimit, searchCursor, collegeId);
        break;
      case "clubs":
        result = await searchClubs(q, searchLimit, searchCursor, collegeId);
        break;
      case "events":
        result = await searchEvents(q, searchLimit, searchCursor, collegeId);
        break;
      case "all":
      default:
        result = await searchAll({
          query: q,
          type: "all",
          limit: searchLimit,
          cursor: searchCursor,
          collegeId,
        });
        break;
    }

    res.status(200).json({
      success: true,
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

