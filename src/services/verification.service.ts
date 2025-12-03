import prisma from "../config/prisma";

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
          batch: true,
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

  // Update verification status
  await prisma.verification.update({
    where: { id: verificationId },
    data: {
      status: "rejected",
      reviewedBy,
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

