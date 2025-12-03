import { Request, Response, NextFunction } from "express";
import { getProfile, updateProfile } from "../services/profile.service";
import { AppError } from "../middleware/errorHandler";
import { processUploadedFile } from "../services/fileUpload.service";

export const getProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const profile = await getProfile(req.user.userId);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = 404;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const updateProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    // Check if avatar was uploaded
    let avatarUrl = req.body.avatar;
    if (req.files && (req.files as any).avatar) {
      const uploadedFile = processUploadedFile((req.files as any).avatar[0]);
      avatarUrl = uploadedFile.url;
    } else if (req.file && req.file.fieldname === "avatar") {
      const uploadedFile = processUploadedFile(req.file);
      avatarUrl = uploadedFile.url;
    }

    // Check if banner was uploaded
    let bannerUrl = req.body.banner;
    if (req.files && (req.files as any).banner) {
      const uploadedFile = processUploadedFile((req.files as any).banner[0]);
      bannerUrl = uploadedFile.url;
    } else if (req.file && req.file.fieldname === "banner") {
      const uploadedFile = processUploadedFile(req.file);
      bannerUrl = uploadedFile.url;
    }

    const profile = await updateProfile(req.user.userId, {
      name: req.body.name,
      batch: req.body.batch,
      avatar: avatarUrl,
      banner: bannerUrl,
    });
    
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
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

