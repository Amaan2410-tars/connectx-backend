import winston from "winston";
import path from "path";
import fs from "fs";

// Create logs directory if it doesn't exist (only in non-production or if directory is writable)
const logsDir = path.join(process.cwd(), "logs");
const isProduction = process.env.NODE_ENV === "production";

// Only create logs directory if we're not in production or if we can write to it
if (!isProduction) {
  if (!fs.existsSync(logsDir)) {
    try {
      fs.mkdirSync(logsDir, { recursive: true });
    } catch (error) {
      console.warn("Could not create logs directory:", error);
    }
  }
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define log format for console (development)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
const transports: winston.transport[] = [];

// Only add file transports if logs directory exists and is writable
if (!isProduction && fs.existsSync(logsDir)) {
  try {
    transports.push(
      // Write all logs to `combined.log`
      new winston.transports.File({
        filename: path.join(logsDir, "combined.log"),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      // Write all logs with level `error` and below to `error.log`
      new winston.transports.File({
        filename: path.join(logsDir, "error.log"),
        level: "error",
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    );
  } catch (error) {
    console.warn("Could not set up file transports:", error);
  }
}

// Always add console transport (for both dev and production)
// In production, console output goes to Render logs
transports.push(
  new winston.transports.Console({
    format: consoleFormat,
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "connectx-backend" },
  transports,
  exceptionHandlers: isProduction ? [
    new winston.transports.Console({
      format: consoleFormat,
    })
  ] : [
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
    }),
    new winston.transports.Console({
      format: consoleFormat,
    })
  ],
  rejectionHandlers: isProduction ? [
    new winston.transports.Console({
      format: consoleFormat,
    })
  ] : [
    new winston.transports.File({
      filename: path.join(logsDir, "rejections.log"),
    }),
    new winston.transports.Console({
      format: consoleFormat,
    })
  ],
});

// Helper functions
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error | any) => {
  logger.error(message, { error: error?.message, stack: error?.stack, ...error });
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

