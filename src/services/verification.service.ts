import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

export const getPendingVerifications = async (collegeId: string) => {
  const verifications = await prisma.verification.findMany({
    where: {
      status: "pending",
      user: {
        collegeId,
        role: "student",
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          batch: true,
          emailVerified: true,
          phoneVerified: true,
          bypassVerified: true,
          college: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return verifications;
};

// Get all pending verifications across all colleges (for super admin)
export const getAllPendingVerifications = async () => {
  // Use basic Prisma query with only fields that definitely exist
  const verifications = await prisma.verification.findMany({
    where: {
      status: "pending",
      user: {
        role: "student",
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          batch: true,
          collegeId: true,
          courseId: true,
          college: {
            select: {
              id: true,
              name: true,
            },
          },
          course: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return verifications;
};

export const approveVerification = async (
  verificationId: string,
  reviewedBy: string
) => {
  // Get verification
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: { user: true },
  });

  if (!verification) {
    throw new Error("Verification not found");
  }

  if (verification.status !== "pending") {
    throw new Error("Verification has already been processed");
  }

  // Update verification status
  await prisma.verification.update({
    where: { id: verificationId },
    data: {
      status: "approved",
      reviewedBy,
    },
  });

  // Update user verified status
  await prisma.user.update({
    where: { id: verification.userId },
    data: {
      verifiedStatus: "approved",
    },
  });

  return { message: "Verification approved successfully" };
};

export const bypassVerification = async (
  userId: string,
  reviewedBy: string
) => {
  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Update user to bypass verification
  await prisma.user.update({
    where: { id: userId },
    data: {
      verifiedStatus: "approved",
      bypassVerified: true,
    },
  });

  // If there's a pending verification, mark it as approved
  const pendingVerification = await prisma.verification.findFirst({
    where: {
      userId,
      status: "pending",
    },
  });

  if (pendingVerification) {
    await prisma.verification.update({
      where: { id: pendingVerification.id },
      data: {
        status: "approved",
        reviewedBy,
      },
    });
  }

  return { message: "Verification bypassed successfully" };
};

export const rejectVerification = async (
  verificationId: string,
  reviewedBy: string
) => {
  // Get verification
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: { user: true },
  });

  if (!verification) {
    throw new Error("Verification not found");
  }

  if (verification.status !== "pending") {
    throw new Error("Verification has already been processed");
  }

  // Update verification status with rejection timestamp
  await prisma.verification.update({
    where: { id: verificationId },
    data: {
      status: "rejected",
      reviewedBy,
      rejectedAt: new Date(),
    },
  });

  // Update user verified status
  await prisma.user.update({
    where: { id: verification.userId },
    data: {
      verifiedStatus: "rejected",
    },
  });

  return { message: "Verification rejected successfully" };
};

