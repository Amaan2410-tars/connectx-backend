import express from "express";
import cors from "cors";
import path from "path";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";
import { morganMiddleware, requestLogger } from "./middleware/logger.middleware";

// API Routes
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import collegeRoutes from "./routes/college.routes";
import studentRoutes from "./routes/student.routes";
import uploadRoutes from "./routes/upload.routes";
import coinRoutes from "./routes/coins.routes";
import premiumRoutes from "./routes/premium.routes";
import legalRoutes from "./routes/legal.routes";
import { premiumWebhookHandler } from "./controllers/premium.controller";

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || (process.env.NODE_ENV === "production" ? false : "http://localhost:8080"),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Logging
app.use(morganMiddleware);
app.use(requestLogger);

// Rate limiting (applied to all routes)
app.use("/api", apiLimiter);

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health endpoint
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    status: "ConnectX Backend is Running",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/college", collegeRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/coins", coinRoutes);
app.use("/api/premium", premiumRoutes);
// Legal pages (public, no auth required)
app.use("/api/legal", legalRoutes);
// Webhook route (no auth required)
app.post("/api/premium/webhook", premiumWebhookHandler);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;

