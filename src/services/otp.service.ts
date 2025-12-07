import prisma from "../config/prisma";
import crypto from "crypto";

// Generate 6-digit OTP
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Check OTP rate limits
export const checkOtpRateLimit = async (
  email?: string,
  phone?: string,
  userId?: string
): Promise<{ allowed: boolean; message?: string }> => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Count requests in last hour
  const hourCount = await prisma.otpRequest.count({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
        ...(userId ? [{ userId }] : []),
      ],
      createdAt: {
        gte: oneHourAgo,
      },
    },
  });

  if (hourCount >= 3) {
    return {
      allowed: false,
      message: "Too many OTP requests. Maximum 3 requests per hour. Please try again later.",
    };
  }

  // Count requests in last 24 hours
  const dayCount = await prisma.otpRequest.count({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
        ...(userId ? [{ userId }] : []),
      ],
      createdAt: {
        gte: oneDayAgo,
      },
    },
  });

  if (dayCount >= 10) {
    return {
      allowed: false,
      message: "Too many OTP requests. Maximum 10 requests per 24 hours. Please try again later.",
    };
  }

  return { allowed: true };
};

// Record OTP request
export const recordOtpRequest = async (
  email?: string,
  phone?: string,
  userId?: string
): Promise<void> => {
  await prisma.otpRequest.create({
    data: {
      email: email || null,
      phone: phone || null,
      userId: userId || null,
    },
  });
};

// Store OTP in user record
export const storeEmailOtp = async (email: string, otp: string): Promise<void> => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.updateMany({
    where: { email },
    data: {
      emailOtp: otp,
      otpExpiresAt: expiresAt,
    },
  });
};

export const storePhoneOtp = async (phone: string, otp: string): Promise<void> => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.updateMany({
    where: { phone },
    data: {
      phoneOtp: otp,
      otpExpiresAt: expiresAt,
    },
  });
};

// Verify OTP
export const verifyEmailOtp = async (email: string, otp: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.emailOtp || !user.otpExpiresAt) {
    return false;
  }

  if (user.otpExpiresAt < new Date()) {
    return false; // OTP expired
  }

  if (user.emailOtp !== otp) {
    return false; // Invalid OTP
  }

  // Mark email as verified and clear OTP
  await prisma.user.update({
    where: { email },
    data: {
      emailVerified: true,
      emailOtp: null,
      otpExpiresAt: null,
    },
  });

  return true;
};

export const verifyPhoneOtp = async (phone: string, otp: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user || !user.phoneOtp || !user.otpExpiresAt) {
    return false;
  }

  if (user.otpExpiresAt < new Date()) {
    return false; // OTP expired
  }

  if (user.phoneOtp !== otp) {
    return false; // Invalid OTP
  }

  // Mark phone as verified and clear OTP
  await prisma.user.update({
    where: { phone },
    data: {
      phoneVerified: true,
      phoneOtp: null,
      otpExpiresAt: null,
    },
  });

  return true;
};

// Send OTP via email (placeholder - integrate with email service)
export const sendEmailOtp = async (email: string, otp: string): Promise<void> => {
  // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  console.log(`📧 Email OTP for ${email}: ${otp}`);
  // In production, send actual email here
};

// Send OTP via SMS (placeholder - integrate with SMS service)
export const sendPhoneOtp = async (phone: string, otp: string): Promise<void> => {
  // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
  console.log(`📱 SMS OTP for ${phone}: ${otp}`);
  // In production, send actual SMS here
};


