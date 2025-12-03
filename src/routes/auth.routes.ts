import { Router } from "express";
import { signup, login, getMe } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { signupSchema, loginSchema } from "../utils/validators/auth.validators";
import { authRequired } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

// Public routes (with strict rate limiting)
router.post("/signup", authLimiter, validate(signupSchema), signup);
router.post("/login", authLimiter, validate(loginSchema), login);

// Protected routes
router.get("/me", authRequired, getMe);

export default router;

