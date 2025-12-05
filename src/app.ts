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
const getAllowedOrigins = (): string[] | string | boolean => {
  const frontendUrl = process.env.FRONTEND_URL;
  const isProduction = process.env.NODE_ENV === "production";
  
  if (frontendUrl) {
    // Support multiple origins (comma-separated) or single origin
    const origins = frontendUrl.split(",").map(url => url.trim()).filter(url => url.length > 0);
    if (origins.length === 0) {
      console.warn("⚠️ FRONTEND_URL is set but empty, falling back to development origins");
      return isProduction ? false : ["http://localhost:8080", "http://localhost:5173"];
    }
    return origins.length === 1 ? origins[0] : origins;
  }
  
  // Development fallback
  if (!isProduction) {
    console.log("🔧 Development mode: Allowing localhost origins");
    return ["http://localhost:8080", "http://localhost:5173"];
  }
  
  // Production: warn if no FRONTEND_URL set
  console.warn("⚠️ Production mode but FRONTEND_URL not set - CORS will deny all requests");
  return false;
};

const corsOptions = {
  origin: getAllowedOrigins(),
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
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Debug endpoint to list registered routes (only in development)
if (process.env.NODE_ENV !== "production") {
  app.get("/debug/routes", (req, res) => {
    const routes: string[] = [];
    app._router?.stack?.forEach((middleware: any) => {
      if (middleware.route) {
        const methods = Object.keys(middleware.route.methods).join(", ").toUpperCase();
        routes.push(`${methods} ${middleware.route.path}`);
      } else if (middleware.name === "router") {
        middleware.handle?.stack?.forEach((handler: any) => {
          if (handler.route) {
            const methods = Object.keys(handler.route.methods).join(", ").toUpperCase();
            routes.push(`${methods} ${middleware.regexp.source.replace(/\\\//g, "/").replace(/\^|\$|\\/g, "")}${handler.route.path}`);
          }
        });
      }
    });
    res.json({
      success: true,
      routes: routes.sort(),
      count: routes.length
    });
  });
}

// API Routes - Register all routes with error handling and logging
try {
  console.log("📦 Registering API routes...");
  
  app.use("/api/auth", authRoutes);
  console.log("✅ Registered: /api/auth");
  
  app.use("/api/admin", adminRoutes);
  console.log("✅ Registered: /api/admin");
  
  app.use("/api/college", collegeRoutes);
  console.log("✅ Registered: /api/college");
  
  app.use("/api/student", studentRoutes);
  console.log("✅ Registered: /api/student");
  
  app.use("/api/upload", uploadRoutes);
  console.log("✅ Registered: /api/upload");
  
  app.use("/api/coins", coinRoutes);
  console.log("✅ Registered: /api/coins");
  
  app.use("/api/premium", premiumRoutes);
  console.log("✅ Registered: /api/premium");
  
  // Legal pages (public, no auth required)
  app.use("/api/legal", legalRoutes);
  console.log("✅ Registered: /api/legal");
  
  // Webhook route (no auth required)
  app.post("/api/premium/webhook", premiumWebhookHandler);
  console.log("✅ Registered: /api/premium/webhook (POST)");
  
  console.log("✅ All routes registered successfully");
} catch (error) {
  console.error("❌ Error registering routes:", error);
  throw error;
}

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;

