import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logger";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error
  logError("Request Error", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get("user-agent"),
  });

  // Send error response
  const errorResponse: any = {
    success: false,
    error: message,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      path: req.path,
      method: req.method,
    };
  }

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

