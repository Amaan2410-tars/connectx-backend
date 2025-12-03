import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectories based on file type
    let subDir = "general";
    if (file.fieldname === "avatar") {
      subDir = "avatars";
    } else if (file.fieldname === "banner") {
      subDir = "banners";
    } else if (file.fieldname === "postImage") {
      subDir = "posts";
    } else if (file.fieldname === "idCard" || file.fieldname === "faceImage") {
      subDir = "verifications";
    } else if (file.fieldname === "eventImage") {
      subDir = "events";
    }

    const dir = path.join(uploadsDir, subDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed image MIME types
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Helper to get file URL
export const getFileUrl = (filePath: string): string => {
  if (!filePath) return "";
  
  // If already a full URL, return as is
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  // Convert local path to URL
  const relativePath = filePath.replace(process.cwd(), "").replace(/\\/g, "/");
  const baseUrl = process.env.BASE_URL || "http://localhost:4000";
  return `${baseUrl}${relativePath}`;
};

// Helper to delete file
export const deleteFile = (filePath: string): void => {
  if (!filePath) return;
  
  // Don't delete if it's a URL (external)
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return;
  }

  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

