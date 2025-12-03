import { Request } from "express";

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateImageFile = (
  req: Request,
  fieldName: string
): ImageValidationResult => {
  const file = req.file;

  if (!file) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds 5MB limit`,
    };
  }

  // Check MIME type
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (!allowedMimes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
    };
  }

  return { isValid: true };
};

export const validateMultipleImages = (
  req: Request,
  fieldName: string,
  maxFiles: number = 10
): ImageValidationResult => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return {
      isValid: false,
      error: `At least one ${fieldName} is required`,
    };
  }

  if (files.length > maxFiles) {
    return {
      isValid: false,
      error: `Maximum ${maxFiles} files allowed`,
    };
  }

  // Validate each file
  for (const file of files) {
    const validation = validateImageFile(
      { ...req, file } as Request,
      fieldName
    );
    if (!validation.isValid) {
      return validation;
    }
  }

  return { isValid: true };
};

