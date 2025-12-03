import prisma from "../config/prisma";
import { SubmitVerificationInput } from "../utils/validators/verificationSubmission.validators";

export const submitVerification = async (
  userId: string,
  data: SubmitVerificationInput
) => {
  // Check if user already has a pending verification
  const existingVerification = await prisma.verification.findFirst({
    where: {
      userId,
      status: "pending",
    },
  });

  if (existingVerification) {
    throw new Error("You already have a pending verification");
  }

  // Create verification
  const verification = await prisma.verification.create({
    data: {
      userId,
      idCardImage: data.idCardImage,
      faceImage: data.faceImage,
      status: "pending",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Update user verification status to pending
  await prisma.user.update({
    where: { id: userId },
    data: {
      verifiedStatus: "pending",
    },
  });

  return verification;
};

export const getVerificationStatus = async (userId: string) => {
  const verification = await prisma.verification.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          verifiedStatus: true,
        },
      },
    },
  });

  return verification;
};

