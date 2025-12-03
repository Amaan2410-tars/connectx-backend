import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { authRequired } from "../middleware/auth.middleware";
import { uploadAvatar, uploadBanner, uploadPostImage, uploadEventImage } from "../middleware/upload.middleware";
import { processUploadedFile } from "../services/fileUpload.service";
import { AppError } from "../middleware/errorHandler";
import { uploadLimiter } from "../middleware/rateLimiter";

const router = Router();

// All upload routes require authentication and rate limiting
router.use(authRequired);
router.use(uploadLimiter);

// Upload avatar
router.post("/avatar", uploadAvatar, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }
    const result = processUploadedFile(req.file);
    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
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
});

// Upload banner
router.post("/banner", uploadBanner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }
    const result = processUploadedFile(req.file);
    res.status(200).json({
      success: true,
      message: "Banner uploaded successfully",
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
});

// Upload post image
router.post("/post", uploadPostImage, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }
    const result = processUploadedFile(req.file);
    res.status(200).json({
      success: true,
      message: "Post image uploaded successfully",
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
});

// Upload event image
router.post("/event", uploadEventImage, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }
    const result = processUploadedFile(req.file);
    res.status(200).json({
      success: true,
      message: "Event image uploaded successfully",
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
});

export default router;

