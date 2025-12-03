import { Request, Response, NextFunction } from "express";
import { upload } from "../utils/fileUpload";
import { validateImageFile } from "../utils/imageValidation";
import { AppError } from "./errorHandler";

// Single image upload middleware
export const uploadSingleImage = (fieldName: string) => {
  return [
    upload.single(fieldName),
    (req: Request, res: Response, next: NextFunction) => {
      const validation = validateImageFile(req, fieldName);
      if (!validation.isValid) {
        const error: AppError = new Error(validation.error);
        error.statusCode = 400;
        return next(error);
      }
      next();
    },
  ];
};

// Multiple images upload middleware
export const uploadMultipleImages = (fieldName: string, maxCount: number = 10) => {
  return [
    upload.array(fieldName, maxCount),
    (req: Request, res: Response, next: NextFunction) => {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        const error: AppError = new Error(`${fieldName} is required`);
        error.statusCode = 400;
        return next(error);
      }
      next();
    },
  ];
};

// Specific upload middlewares
export const uploadAvatar = uploadSingleImage("avatar");
export const uploadBanner = uploadSingleImage("banner");
export const uploadPostImage = uploadSingleImage("postImage");
export const uploadEventImage = uploadSingleImage("eventImage");
export const uploadProfileImages = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);
export const uploadVerificationImages = upload.fields([
  { name: "idCard", maxCount: 1 },
  { name: "faceImage", maxCount: 1 },
]);

