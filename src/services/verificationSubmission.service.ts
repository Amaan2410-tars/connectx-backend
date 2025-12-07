import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";
import { SubmitVerificationInput } from "../utils/validators/verificationSubmission.validators";

// Placeholder function to extract text from ID card image using OCR
// In production, this would use OCR (Tesseract.js, Google Vision API, etc.)
const extractIdCardText = async (idCardImageUrl: string): Promise<string> => {
  // TODO: Implement OCR to extract text from ID card
  // For now, return placeholder text
  console.log(`🔍 Extracting text from ID card: ${idCardImageUrl}`);
  return "MIT Computer Science Engineering"; // Placeholder - replace with actual OCR
};

// Extract college name from ID card text
const extractCollegeNameFromId = async (idCardImageUrl: string): Promise<string> => {
  const text = await extractIdCardText(idCardImageUrl);
  // Simple extraction - in production, use better NLP/pattern matching
  return text.split(" ")[0] || "MIT"; // Placeholder
};

// Extract course name from ID card text
const extractCourseFromId = async (idCardImageUrl: string, collegeCourses: Array<{ id: string; name: string }>): Promise<string | null> => {
  const text = await extractIdCardText(idCardImageUrl);
  
  if (!collegeCourses || collegeCourses.length === 0) {
    return null;
  }

  // Find closest matching course using simple string matching
  // In production, use better fuzzy matching algorithms
  const textLower = text.toLowerCase();
  
  for (const course of collegeCourses) {
    const courseNameLower = course.name.toLowerCase();
    // Check if course name appears in extracted text
    if (textLower.includes(courseNameLower) || courseNameLower.includes(textLower)) {
      return course.name;
    }
    
    // Check for common course abbreviations
    const courseWords = course.name.split(" ");
    for (const word of courseWords) {
      if (word.length > 3 && textLower.includes(word.toLowerCase())) {
        return course.name;
      }
    }
  }
  
  return null;
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

  // Extract course from ID card
  const collegeCourses = await prisma.course.findMany({
    where: { collegeId: verification.user.collegeId },
    select: { id: true, name: true },
  });

  const courseDetected = await extractCourseFromId(verification.idCardImage, collegeCourses);
  
  // Check if detected course matches user's selected course
  let courseMatch = false;
  if (verification.user.courseId && courseDetected) {
    const userCourse = await prisma.course.findUnique({
      where: { id: verification.user.courseId },
      select: { name: true },
    });
    
    if (userCourse) {
      const userCourseName = userCourse.name.toLowerCase();
      const detectedCourseName = courseDetected.toLowerCase();
      courseMatch = userCourseName.includes(detectedCourseName) || 
                    detectedCourseName.includes(userCourseName);
    }
  }

  // Extract full ID card text for admin review
  const idCardText = await extractIdCardText(verification.idCardImage);

  // Calculate match score: faceMatchScore * 0.6 + collegeMatch (20) + courseMatch (20)
  const matchScore = Math.floor(
    faceMatchScore * 0.6 + 
    (collegeMatch ? 20 : 0) + 
    (courseMatch ? 20 : 0)
  );

  // Determine status based on match score
  let status: "approved" | "pending" | "rejected";
  let analysisRemarks: string;

  if (matchScore >= 80) {
    // Auto-approve for 80-100%
    status = "approved";
    analysisRemarks = `Face match: ${faceMatchScore}%, College match: ${collegeMatch ? "Yes" : "No"}, Course match: ${courseMatch ? "Yes" : "No"}. Auto-approved (Score: ${matchScore}%)`;
  } else if (matchScore >= 40) {
    // Send to admin for 40-80%
    status = "pending";
    analysisRemarks = `Face match: ${faceMatchScore}%, College match: ${collegeMatch ? "Yes" : "No"}, Course match: ${courseMatch ? "Yes" : "No"}. Requires admin review (Score: ${matchScore}%)`;
  } else {
    // Auto-reject for < 40%
    status = "rejected";
    analysisRemarks = `Face match: ${faceMatchScore}%, College match: ${collegeMatch ? "Yes" : "No"}, Course match: ${courseMatch ? "Yes" : "No"}. Auto-rejected (Score: ${matchScore}%)`;
  }

  // Update verification with face image and analysis results
  verification = await prisma.verification.update({
    where: { id: verification.id },
    data: {
      faceImage: faceImageUrl,
      faceMatchScore,
      collegeMatch,
      courseMatch,
      courseDetected,
      idCardText,
      matchScore,
      analysisRemarks,
      status,
      rejectedAt: status === "rejected" ? new Date() : null,
      reviewedBy: status === "approved" ? "system" : null,
    },
    include: {
      user: {
        include: {
          college: true,
        },
      },
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
  // Use raw query to handle potential schema mismatches
  const userResult = await prisma.$queryRaw<Array<{
    id: string;
    emailVerified: boolean | null;
    phoneVerified: boolean | null;
    verifiedStatus: string | null;
    bypassVerified: boolean | null;
  }>>(
    Prisma.sql`
      SELECT 
        id,
        COALESCE("emailVerified", false) as "emailVerified",
        COALESCE("phoneVerified", false) as "phoneVerified",
        "verifiedStatus",
        COALESCE("bypassVerified", false) as "bypassVerified"
      FROM "User"
      WHERE id = ${userId}
      LIMIT 1
    `
  );

  if (!userResult || userResult.length === 0) {
    throw new Error("User not found");
  }

  const user = userResult[0];

  // Get latest verification using raw SQL to handle missing columns gracefully
  // Check if new columns exist first, then query accordingly
  let latestVerification: any = null;
  
  try {
    // First, check if the new columns exist by querying information_schema
    const columnCheck = await prisma.$queryRaw<Array<{ column_name: string }>>(
      Prisma.sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Verification' 
        AND column_name IN ('courseMatch', 'courseDetected', 'idCardText')
        LIMIT 3
      `
    );
    
    const hasNewColumns = columnCheck.length > 0;
    
    if (hasNewColumns) {
      // New columns exist - use full query
      const verifications = await prisma.$queryRaw<Array<{
        id: string;
        userId: string;
        idCardImage: string;
        faceImage: string;
        status: string;
        reviewedBy: string | null;
        matchScore: number | null;
        faceMatchScore: number | null;
        collegeMatch: boolean | null;
        courseMatch: boolean | null;
        courseDetected: string | null;
        idCardText: string | null;
        analysisRemarks: string | null;
        rejectedAt: Date | null;
        createdAt: Date;
      }>>(
        Prisma.sql`
          SELECT 
            id, "userId", "idCardImage", "faceImage", status, "reviewedBy",
            "matchScore", "faceMatchScore", "collegeMatch",
            "courseMatch", "courseDetected", "idCardText",
            "analysisRemarks", "rejectedAt", "createdAt"
          FROM "Verification"
          WHERE "userId" = ${userId}
          ORDER BY "createdAt" DESC
          LIMIT 1
        `
      );
      
      latestVerification = verifications[0] ? {
        id: verifications[0].id,
        userId: verifications[0].userId,
        idCardImage: verifications[0].idCardImage,
        faceImage: verifications[0].faceImage,
        status: verifications[0].status as any,
        reviewedBy: verifications[0].reviewedBy,
        matchScore: verifications[0].matchScore,
        faceMatchScore: verifications[0].faceMatchScore,
        collegeMatch: verifications[0].collegeMatch,
        courseMatch: verifications[0].courseMatch,
        courseDetected: verifications[0].courseDetected,
        idCardText: verifications[0].idCardText,
        analysisRemarks: verifications[0].analysisRemarks,
        rejectedAt: verifications[0].rejectedAt,
        createdAt: verifications[0].createdAt,
      } : null;
    } else {
      // New columns don't exist - use basic query
      const verifications = await prisma.$queryRaw<Array<{
        id: string;
        userId: string;
        idCardImage: string;
        faceImage: string;
        status: string;
        reviewedBy: string | null;
        matchScore: number | null;
        faceMatchScore: number | null;
        collegeMatch: boolean | null;
        analysisRemarks: string | null;
        rejectedAt: Date | null;
        createdAt: Date;
      }>>(
        Prisma.sql`
          SELECT 
            id, "userId", "idCardImage", "faceImage", status, "reviewedBy",
            "matchScore", "faceMatchScore", "collegeMatch",
            "analysisRemarks", "rejectedAt", "createdAt"
          FROM "Verification"
          WHERE "userId" = ${userId}
          ORDER BY "createdAt" DESC
          LIMIT 1
        `
      );
      
      latestVerification = verifications[0] ? {
        id: verifications[0].id,
        userId: verifications[0].userId,
        idCardImage: verifications[0].idCardImage,
        faceImage: verifications[0].faceImage,
        status: verifications[0].status as any,
        reviewedBy: verifications[0].reviewedBy,
        matchScore: verifications[0].matchScore,
        faceMatchScore: verifications[0].faceMatchScore,
        collegeMatch: verifications[0].collegeMatch,
        courseMatch: null,
        courseDetected: null,
        idCardText: null,
        analysisRemarks: verifications[0].analysisRemarks,
        rejectedAt: verifications[0].rejectedAt,
        createdAt: verifications[0].createdAt,
      } : null;
    }
  } catch (error: any) {
    // If even the column check fails, log and use minimal query
    console.error("Error checking verification columns:", error);
    try {
      const verifications = await prisma.$queryRaw<Array<{
        id: string;
        userId: string;
        status: string;
        createdAt: Date;
      }>>(
        Prisma.sql`
          SELECT id, "userId", status, "createdAt"
          FROM "Verification"
          WHERE "userId" = ${userId}
          ORDER BY "createdAt" DESC
          LIMIT 1
        `
      );
      
      latestVerification = verifications[0] ? {
        id: verifications[0].id,
        userId: verifications[0].userId,
        status: verifications[0].status as any,
        createdAt: verifications[0].createdAt,
        courseMatch: null,
        courseDetected: null,
        idCardText: null,
      } : null;
    } catch (fallbackError: any) {
      console.error("Fallback query also failed:", fallbackError);
      latestVerification = null;
    }
  }

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
      emailVerified: user.emailVerified || false,
      phoneVerified: user.phoneVerified || false,
      verifiedStatus: user.verifiedStatus || "pending",
      bypassVerified: user.bypassVerified || false,
    },
    verification: latestVerification,
    canRetry,
    retryAfter,
  };
};

