import { Request, Response, NextFunction } from "express";
import {
  submitVerification,
  getVerificationStatus,
} from "../services/verificationSubmission.service";
import { AppError } from "../middleware/errorHandler";
import { processVerificationFiles } from "../services/fileUpload.service";

export const submitVerificationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    // Check if files were uploaded
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files || !files.idCard || !files.faceImage) {
      // Fallback to URL-based submission (for backward compatibility)
      if (!req.body.idCardImage || !req.body.faceImage) {
        throw new Error("ID card and face images are required");
      }
      const verification = await submitVerification(req.user.userId, {
        idCardImage: req.body.idCardImage,
        faceImage: req.body.faceImage,
      });
      return res.status(201).json({
        success: true,
        message: "Verification submitted successfully",
        data: verification,
      });
    }

    // Process uploaded files
    const uploadedFiles = processVerificationFiles(files);
    
    const verification = await submitVerification(req.user.userId, {
      idCardImage: uploadedFiles.idCard.url,
      faceImage: uploadedFiles.faceImage.url,
    });
    
    res.status(201).json({
      success: true,
      message: "Verification submitted successfully",
      data: verification,
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

export const getVerificationStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const verification = await getVerificationStatus(req.user.userId);
    res.status(200).json({
      success: true,
      data: verification,
    });
  } catch (error) {
    next(error);
  }
};

