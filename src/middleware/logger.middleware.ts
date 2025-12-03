import morgan from "morgan";
import { logger } from "../utils/logger";

// Morgan token for request ID (if needed)
morgan.token("id", (req: any) => req.id);

// Custom format for morgan
const morganFormat = process.env.NODE_ENV === "production" 
  ? ":remote-addr - :remote-user [:date[clf]] \":method :url HTTP/:http-version\" :status :res[content-length] \":referrer\" \":user-agent\""
  : "dev";

// Create morgan middleware
export const morganMiddleware = morgan(morganFormat, {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    },
  },
});

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    };

    if (res.statusCode >= 400) {
      logger.warn("HTTP Request", logData);
    } else {
      logger.info("HTTP Request", logData);
    }
  });

  next();
};

