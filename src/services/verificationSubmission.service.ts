import prisma from "../config/prisma";
import { SubmitVerificationInput } from "../utils/validators/verificationSubmission.validators";

// Placeholder function to extract college name from ID card image
// In production, this would use OCR (Tesseract.js, Google Vision API, etc.)
const extractCollegeNameFromId = async (idCardImageUrl: string): Promise<string> => {
  // TODO: Implement OCR to extract college name from ID card
  // For now, return placeholder
  console.log(`🔍 Extracting college name from ID card: ${idCardImageUrl}`);
  return "MIT"; // Placeholder - replace with actual OCR
};

// Placeholder function for face matching
// In production, this would use face recognition APIs (AWS Rekognition, Face++, etc.)
const performFaceMatching = async (idCardImageUrl: string, faceImageUrl: string): Promise<number> => {
  // TODO: Implement face matching algorithm
  // For now, return random score between 70-90
  const score = Math.floor(Math.random() * 21) + 70; // 70-90
  console.log(`👤 Face matching score: ${score}%`);
  return score;
};

export const uploadIdCard = async (userId: string, idCardImageUrl: string) => {
  // Check if user has a recent rejection (within 3 hours)
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const recentRejection = await prisma.verification.findFirst({
    where: {
      userId,
      status: "rejected",
      rejectedAt: {
        gte: threeHoursAgo,
      },
    },
  });

  if (recentRejection) {
    const timeRemaining = Math.ceil((recentRejection.rejectedAt!.getTime() + 3 * 60 * 60 * 1000 - Date.now()) / (60 * 1000));
    throw new Error(`Verification was recently rejected. Please wait ${Math.ceil(timeRemaining / 60)} hours before trying again.`);
  }

  // Check if user already has an approved verification
  const approvedVerification = await prisma.verification.findFirst({
    where: {
      userId,
      status: "approved",
    },
  });

  if (approvedVerification) {
    throw new Error("You are already verified");
  }

  // Check if user already has a pending verification
  let verification = await prisma.verification.findFirst({
    where: {
      userId,
      status: "pending",
    },
  });

  if (verification) {
    // Update existing verification with ID card
    verification = await prisma.verification.update({
      where: { id: verification.id },
      data: {
        idCardImage: idCardImageUrl,
      },
    });
  } else {
    // Create new verification with only ID card
    verification = await prisma.verification.create({
      data: {
        userId,
        idCardImage: idCardImageUrl,
        faceImage: "", // Will be updated when face is uploaded
        status: "pending",
      },
    });
  }

  return verification;
};

export const uploadFaceImage = async (userId: string, faceImageUrl: string) => {
  // Check if user has a recent rejection (within 3 hours)
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const recentRejection = await prisma.verification.findFirst({
    where: {
      userId,
      status: "rejected",
      rejectedAt: {
        gte: threeHoursAgo,
      },
    },
  });

  if (recentRejection) {
    const timeRemaining = Math.ceil((recentRejection.rejectedAt!.getTime() + 3 * 60 * 60 * 1000 - Date.now()) / (60 * 1000));
    throw new Error(`Verification was recently rejected. Please wait ${Math.ceil(timeRemaining / 60)} hours before trying again.`);
  }

  // Check if user already has a pending or approved verification
  const existingVerification = await prisma.verification.findFirst({
    where: {
      userId,
      status: {
        in: ["pending", "approved"],
      },
    },
    include: {
      user: {
        include: {
          college: true,
        },
      },
    },
  });

  if (existingVerification && existingVerification.status === "approved") {
    throw new Error("You are already verified");
  }

  // Check if user has a pending verification with ID card
  let verification = await prisma.verification.findFirst({
    where: {
      userId,
      status: "pending",
    },
    include: {
      user: {
        include: {
          college: true,
        },
      },
    },
  });

  if (!verification || !verification.idCardImage) {
    throw new Error("Please upload ID card first");
  }

  // Perform face matching
  const faceMatchScore = await performFaceMatching(verification.idCardImage, faceImageUrl);

  // Extract college name from ID card
  const extractedCollegeName = await extractCollegeNameFromId(verification.idCardImage);
  
  // Check if extracted college matches user's selected college
  const userCollegeName = verification.user.college?.name || "";
  const collegeMatch = userCollegeName.toLowerCase().includes(extractedCollegeName.toLowerCase()) ||
                       extractedCollegeName.toLowerCase().includes(userCollegeName.toLowerCase());

  // Calculate match score
  const matchScore = Math.floor(faceMatchScore * 0.7 + (collegeMatch ? 30 : 0));

  // Determine status based on match score
  let status: "approved" | "pending" | "rejected";
  let analysisRemarks: string;

  if (matchScore >= 80) {
    // Auto-approve for 80-100%
    status = "approved";
    analysisRemarks = `Face match: ${faceMatchScore}%, College match: ${collegeMatch ? "Yes" : "No"}. Auto-approved (Score: ${matchScore}%)`;
  } else if (matchScore >= 40) {
    // Send to admin for 40-80%
    status = "pending";
    analysisRemarks = `Face match: ${faceMatchScore}%, College match: ${collegeMatch ? "Yes" : "No"}. Requires admin review (Score: ${matchScore}%)`;
  } else {
    // Auto-reject for < 40%
    status = "rejected";
    analysisRemarks = `Face match: ${faceMatchScore}%, College match: ${collegeMatch ? "Yes" : "No"}. Auto-rejected (Score: ${matchScore}%)`;
  }

  // Update verification with face image and analysis results
  verification = await prisma.verification.update({
    where: { id: verification.id },
    data: {
      faceImage: faceImageUrl,
      faceMatchScore,
      collegeMatch,
      matchScore,
      analysisRemarks,
      status,
      rejectedAt: status === "rejected" ? new Date() : null,
      reviewedBy: status === "approved" ? "system" : null,
    },
  });

  // Update user verification status
  await prisma.user.update({
    where: { id: userId },
    data: {
      verifiedStatus: status,
    },
  });

  return verification;
};

export const submitVerification = async (
  userId: string,
  data: SubmitVerificationInput
) => {
  // This is the legacy method - use uploadIdCard and uploadFaceImage instead
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

  // Perform face matching
  const faceMatchScore = await performFaceMatching(data.idCardImage, data.faceImage);

  // Extract college name from ID card
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { college: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const extractedCollegeName = await extractCollegeNameFromId(data.idCardImage);
  const userCollegeName = user.college?.name || "";
  const collegeMatch = userCollegeName.toLowerCase().includes(extractedCollegeName.toLowerCase()) ||
                       extractedCollegeName.toLowerCase().includes(userCollegeName.toLowerCase());

  // Calculate match score
  const matchScore = Math.floor(faceMatchScore * 0.7 + (collegeMatch ? 30 : 0));

  // Create verification
  const verification = await prisma.verification.create({
    data: {
      userId,
      idCardImage: data.idCardImage,
      faceImage: data.faceImage,
      status: "pending",
      faceMatchScore,
      collegeMatch,
      matchScore,
      analysisRemarks: `Face match: ${faceMatchScore}%, College match: ${collegeMatch ? "Yes" : "No"}`,
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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      verifications: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const latestVerification = user.verifications[0] || null;

  // Check if user can retry verification (3 hours after rejection)
  let canRetry = true;
  let retryAfter: Date | null = null;

  if (latestVerification?.status === "rejected" && latestVerification.rejectedAt) {
    const threeHoursAfterRejection = new Date(latestVerification.rejectedAt.getTime() + 3 * 60 * 60 * 1000);
    canRetry = new Date() >= threeHoursAfterRejection;
    if (!canRetry) {
      retryAfter = threeHoursAfterRejection;
    }
  }

  return {
    user: {
      id: user.id,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      verifiedStatus: user.verifiedStatus,
      bypassVerified: user.bypassVerified,
    },
    verification: latestVerification,
    canRetry,
    retryAfter,
  };
};

