import { getFileUrl, deleteFile } from "../utils/fileUpload";
import path from "path";

export interface UploadResult {
  url: string;
  path: string;
  filename: string;
}

export const processUploadedFile = (file: Express.Multer.File): UploadResult => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  const fileUrl = getFileUrl(file.path);
  
  return {
    url: fileUrl,
    path: file.path,
    filename: file.filename,
  };
};

export const processMultipleFiles = (files: Express.Multer.File[]): UploadResult[] => {
  if (!files || files.length === 0) {
    throw new Error("No files uploaded");
  }

  return files.map(processUploadedFile);
};

export const processVerificationFiles = (
  files: { [fieldname: string]: Express.Multer.File[] }
): { idCard: UploadResult; faceImage: UploadResult } => {
  if (!files.idCard || !files.idCard[0]) {
    throw new Error("ID card image is required");
  }

  if (!files.faceImage || !files.faceImage[0]) {
    throw new Error("Face image is required");
  }

  return {
    idCard: processUploadedFile(files.idCard[0]),
    faceImage: processUploadedFile(files.faceImage[0]),
  };
};

export const deleteUploadedFile = (filePath: string): void => {
  deleteFile(filePath);
};

