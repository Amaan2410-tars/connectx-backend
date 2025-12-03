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

// Signup user
export const signupUser = async (data: SignupInput) => {
  const { email, password, name, phone, collegeId, batch, role } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Check if phone is already taken (if provided)
  if (phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      throw new Error("User with this phone number already exists");
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Determine user role
  const userRole: Role = role || "student";

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone: phone || null,
      collegeId: collegeId || null,
      batch: batch || null,
      role: userRole,
    },
    select: {
      id: true,
      name: true,
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

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

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

