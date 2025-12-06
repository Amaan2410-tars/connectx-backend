import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { SignupInput, LoginInput } from "../utils/validators/auth.validators";
import { Role, Prisma } from "@prisma/client";

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
  const { email, password, name, username, phone, collegeId, courseId, batch, role } = data;

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

  // Validate that courseId exists and belongs to the selected college
  if (courseId) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error("Invalid course selected. Please select a valid course.");
    }

    if (course.collegeId !== collegeId) {
      throw new Error("Selected course does not belong to the selected college.");
    }
  } else {
    throw new Error("Course selection is required.");
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
      courseId,
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

  // Find user using raw query to avoid Prisma schema mismatch
  // This works even if new columns don't exist yet
  const normalizedEmail = email.toLowerCase().trim();
  const users = await prisma.$queryRaw<Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    password: string;
    role: string;
    collegeId: string | null;
    batch: string | null;
    avatar: string | null;
    banner: string | null;
    verifiedStatus: string;
    points: number;
    createdAt: Date;
  }>>(
    Prisma.sql`
      SELECT 
        id, name, email, phone, password, role, 
        "collegeId", batch, avatar, banner, 
        "verifiedStatus", points, "createdAt"
      FROM "User"
      WHERE LOWER(TRIM(email)) = LOWER(TRIM(${normalizedEmail}))
      LIMIT 1
    `
  );

  const user = users[0];
  
  if (!user) {
    console.log("❌ User not found for email:", email);
    throw new Error("Invalid email or password");
  }

  // Cast role to Role enum type
  const userWithRole = {
    ...user,
    role: user.role as Role,
  };

  console.log("👤 User found:", userWithRole.email, "Role:", userWithRole.role);

  // Verify password
  if (!userWithRole.password) {
    console.log("❌ User has no password set");
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(password, userWithRole.password);

  if (!isPasswordValid) {
    console.log("❌ Password mismatch for user:", userWithRole.email);
    throw new Error("Invalid email or password");
  }

  console.log("✅ Password verified for user:", userWithRole.email);

  // Generate tokens
  const accessToken = generateAccessToken(userWithRole.id, userWithRole.role);
  const refreshToken = generateRefreshToken(userWithRole.id);

  // Return user without password
  const { password: _, ...userWithoutPassword } = userWithRole;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

// Get user by ID - using raw query to handle schema mismatches
export const getUserById = async (userId: string) => {
  // Use raw query to handle potential missing columns
  const users = await prisma.$queryRaw<Array<{
    id: string;
    name: string;
    username: string;
    email: string;
    phone: string | null;
    role: string;
    collegeId: string | null;
    batch: string | null;
    avatar: string | null;
    banner: string | null;
    verifiedStatus: string;
    emailVerified: boolean | null;
    phoneVerified: boolean | null;
    points: number;
    createdAt: Date;
    college_id: string | null;
    college_name: string | null;
    college_slug: string | null;
    college_logo: string | null;
  }>>(
    Prisma.sql`
      SELECT 
        u.id, u.name, u.username, u.email, u.phone, u.role,
        u."collegeId", u.batch, u.avatar, u.banner,
        u."verifiedStatus", 
        COALESCE(u."emailVerified", false) as "emailVerified",
        COALESCE(u."phoneVerified", false) as "phoneVerified",
        u.points, u."createdAt",
        c.id as college_id,
        c.name as college_name,
        c.slug as college_slug,
        c.logo as college_logo
      FROM "User" u
      LEFT JOIN "College" c ON u."collegeId" = c.id
      WHERE u.id = ${userId}
      LIMIT 1
    `
  );

  if (!users || users.length === 0) {
    throw new Error("User not found");
  }

  const user = users[0];

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role as Role,
    collegeId: user.collegeId,
    batch: user.batch,
    avatar: user.avatar,
    banner: user.banner,
    verifiedStatus: user.verifiedStatus as any,
    emailVerified: user.emailVerified || false,
    phoneVerified: user.phoneVerified || false,
    points: user.points,
    createdAt: user.createdAt,
    college: user.college_id ? {
      id: user.college_id,
      name: user.college_name,
      slug: user.college_slug,
      logo: user.college_logo,
    } : null,
  };
};

