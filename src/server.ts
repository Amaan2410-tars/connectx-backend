import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

// Import after dotenv is configured
import app from "./app";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 4000;

// Start server with error handling
try {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
} catch (error) {
  console.error("❌ Failed to start server:", error);
  logger.error("Failed to start server", error);
  process.exit(1);
}

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  logger.error("Uncaught Exception", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  logger.error("Unhandled Rejection", { reason, promise });
  process.exit(1);
});

