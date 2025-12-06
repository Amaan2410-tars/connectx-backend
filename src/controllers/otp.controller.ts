import { Request, Response, NextFunction } from "express";
import {
  generateOTP,
  checkOtpRateLimit,
  recordOtpRequest,
  storeEmailOtp,
  storePhoneOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
  sendEmailOtp,
  sendPhoneOtp,
} from "../services/otp.service";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const sendEmailOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

const sendPhoneOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(10, "Phone number is required"),
  }),
});

const verifyEmailOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
  }),
});

const verifyPhoneOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(10, "Phone number is required"),
    otp: z.string().length(6, "OTP must be 6 digits"),
  }),
});

export const sendEmailOtpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // Check rate limit
    const rateLimitCheck = await checkOtpRateLimit(email);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: rateLimitCheck.message,
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    await storeEmailOtp(email, otp);
    await recordOtpRequest(email);

    // Send OTP (placeholder - integrate with email service)
    await sendEmailOtp(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to email successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const sendPhoneOtpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone } = req.body;

    // Check rate limit
    const rateLimitCheck = await checkOtpRateLimit(undefined, phone);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: rateLimitCheck.message,
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    await storePhoneOtp(phone, otp);
    await recordOtpRequest(undefined, phone);

    // Send OTP (placeholder - integrate with SMS service)
    await sendPhoneOtp(phone, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to phone successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailOtpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;

    const isValid = await verifyEmailOtp(email, otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPhoneOtpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone, otp } = req.body;

    const isValid = await verifyPhoneOtp(phone, otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    res.status(200).json({
      success: true,
      message: "Phone verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export { sendEmailOtpSchema, sendPhoneOtpSchema, verifyEmailOtpSchema, verifyPhoneOtpSchema };

