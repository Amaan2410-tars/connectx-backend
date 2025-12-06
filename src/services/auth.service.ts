import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { SignupInput, LoginInput } from "../utils/validators/auth.validators";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "connectx_jwt_secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "connectx_refresh_secret";

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Generate access token
export const generateAccessToken = (userId: string, role: Role): string => {
  return jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: "15m", // 15 minutes
  });
};

// Generate refresh token
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d", // 7 days
  });
};

// Signup user - requires OTP verification first
export const signupUser = async (data: SignupInput) => {
  const { email, password, name, username, phone, collegeId, batch, role } = data;

  // Check if user already exists by email
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Check if username already exists
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    throw new Error("Username is already taken");
  }

  // Check if phone is already taken
  const existingPhone = await prisma.user.findUnique({
    where: { phone },
  });

  if (existingPhone) {
    throw new Error("User with this phone number already exists");
  }

  // Validate that collegeId exists
  const college = await prisma.college.findUnique({
    where: { id: collegeId },
  });

  if (!college) {
    throw new Error("Invalid college selected. Please select a valid college.");
  }

  // IMPORTANT: Check if email and phone are verified via OTP
  // This should be checked before creating the user
  // For now, we'll create the user but they must verify before accessing the app
  // In a production system, you might want to create a temporary user record first

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Determine user role
  const userRole: Role = role || "student";

  // Create user (emailVerified and phoneVerified will be false initially)
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      name,
      phone,
      collegeId,
      batch,
      role: userRole,
      emailVerified: false, // Must verify via OTP
      phoneVerified: false, // Must verify via OTP
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
      role: true,
      collegeId: true,
      batch: true,
      avatar: true,
      banner: true,
      verifiedStatus: true,
      emailVerified: true,
      phoneVerified: true,
      points: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

// Login user
export const loginUser = async (data: LoginInput) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Find user - use minimal select to avoid schema mismatch errors
  // If new verification fields don't exist yet, this will still work
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
      password: true,
      role: true,
      collegeId: true,
      batch: true,
      avatar: true,
      banner: true,
      verifiedStatus: true,
      points: true,
      coins: true,
      isPremium: true,
      createdAt: true,
    },
  });

  if (!user) {
    console.log("❌ User not found for email:", email);
    throw new Error("Invalid email or password");
  }

  console.log("👤 User found:", user.email, "Role:", user.role);

  // Verify password
  if (!user.password) {
    console.log("❌ User has no password set");
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    console.log("❌ Password mismatch for user:", user.email);
    throw new Error("Invalid email or password");
  }

  console.log("✅ Password verified for user:", user.email);

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

// Get user by ID
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
      role: true,
      collegeId: true,
      batch: true,
      avatar: true,
      banner: true,
      verifiedStatus: true,
      points: true,
      createdAt: true,
      college: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

