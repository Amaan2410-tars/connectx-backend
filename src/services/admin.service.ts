import prisma from "../config/prisma";
import { hashPassword } from "./auth.service";
import { CreateCollegeAdminInput } from "../utils/validators/admin.validators";

export const createCollegeAdmin = async (data: CreateCollegeAdminInput) => {
  const { email, password, name, phone, collegeId } = data;

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

  // Verify college exists
  const college = await prisma.college.findUnique({
    where: { id: collegeId },
  });

  if (!college) {
    throw new Error("College not found");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create college admin user
  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone: phone || null,
      collegeId,
      role: "college_admin",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      collegeId: true,
      createdAt: true,
      college: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return admin;
};

export const deleteUser = async (userId: string) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Delete user (cascade will handle related records)
  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: "User deleted successfully" };
};

export const deletePost = async (postId: string) => {
  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  // Delete post (cascade will handle likes and comments)
  await prisma.post.delete({
    where: { id: postId },
  });

  return { message: "Post deleted successfully" };
};

