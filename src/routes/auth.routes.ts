import { Router } from "express";
import { signup, login, getMe } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { signupSchema, loginSchema } from "../utils/validators/auth.validators";
import { authRequired } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimiter";
import { getCollegesForSignupHandler } from "../controllers/college.controller";
import {
  sendEmailOtpHandler,
  sendPhoneOtpHandler,
  verifyEmailOtpHandler,
  verifyPhoneOtpHandler,
  sendEmailOtpSchema,
  sendPhoneOtpSchema,
  verifyEmailOtpSchema,
  verifyPhoneOtpSchema,
} from "../controllers/otp.controller";

const router = Router();

// OTP routes (public, with rate limiting)
router.post("/send-email-otp", authLimiter, validate(sendEmailOtpSchema), sendEmailOtpHandler);
router.post("/send-phone-otp", authLimiter, validate(sendPhoneOtpSchema), sendPhoneOtpHandler);
router.post("/verify-email-otp", authLimiter, validate(verifyEmailOtpSchema), verifyEmailOtpHandler);
router.post("/verify-phone-otp", authLimiter, validate(verifyPhoneOtpSchema), verifyPhoneOtpHandler);

// Public routes (with strict rate limiting)
router.post("/signup", authLimiter, validate(signupSchema), signup);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/colleges", getCollegesForSignupHandler); // Public endpoint for signup page

// Protected routes
router.get("/me", authRequired, getMe);

export default router;

