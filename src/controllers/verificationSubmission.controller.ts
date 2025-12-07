import { Request, Response, NextFunction } from "express";
import {
  submitVerification,
  getVerificationStatus,
  uploadIdCard,
  uploadFaceImage,
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
  } catch (error: any) {
    console.error("Error in getVerificationStatusHandler:", error);
    console.error("Error stack:", error?.stack);
    console.error("Error message:", error?.message);
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = appError.statusCode || 500;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const uploadIdCardHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    let idCardImageUrl: string;
    
    if (files && files.idCard && files.idCard[0]) {
      const uploadedFiles = processVerificationFiles({ idCard: files.idCard });
      idCardImageUrl = uploadedFiles.idCard.url;
    } else if (req.body.idCardImage) {
      idCardImageUrl = req.body.idCardImage;
    } else {
      throw new Error("ID card image is required");
    }

    const verification = await uploadIdCard(req.user.userId, idCardImageUrl);
    
    res.status(200).json({
      success: true,
      message: "ID card uploaded successfully",
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

export const uploadFaceImageHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    let faceImageUrl: string;
    
    if (files && files.faceImage && files.faceImage[0]) {
      const uploadedFiles = processVerificationFiles({ faceImage: files.faceImage });
      faceImageUrl = uploadedFiles.faceImage.url;
    } else if (req.body.faceImage) {
      faceImageUrl = req.body.faceImage;
    } else {
      throw new Error("Face image is required");
    }

    const verification = await uploadFaceImage(req.user.userId, faceImageUrl);
    
    res.status(200).json({
      success: true,
      message: "Face image uploaded and analyzed successfully",
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

