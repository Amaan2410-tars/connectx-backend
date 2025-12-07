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
  try {
    // Check if courseId column exists in User table
    const userColumns = await prisma.$queryRaw<Array<{ column_name: string }>>(
      Prisma.sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'courseId'
        LIMIT 1
      `
    );
    
    const hasCourseId = userColumns.length > 0;
    
    // Check if Course table exists
    const courseTable = await prisma.$queryRaw<Array<{ table_name: string }>>(
      Prisma.sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'Course'
        LIMIT 1
      `
    );
    
    const hasCourseTable = courseTable.length > 0;
    
    if (hasCourseId && hasCourseTable) {
      // Course fields exist - use full query
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
    } else {
      // Course fields don't exist - use basic query
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
              college: {
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

      // Add null course fields for compatibility
      return verifications.map((v: any) => ({
        ...v,
        user: {
          ...v.user,
          courseId: null,
          course: null,
        },
      }));
    }
  } catch (error: any) {
    console.error("Error in getAllPendingVerifications:", error);
    // Ultimate fallback - use raw SQL with only basic fields
    try {
      const verifications = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`
          SELECT 
            v.id, v."userId", v."idCardImage", v."faceImage", v.status,
            v."matchScore", v."faceMatchScore", v."collegeMatch",
            v."analysisRemarks", v."createdAt",
            u.id as user_id, u.name as user_name, u.email as user_email,
            u.phone as user_phone, u.batch as user_batch, u."collegeId" as user_collegeId,
            c.id as college_id, c.name as college_name
          FROM "Verification" v
          INNER JOIN "User" u ON v."userId" = u.id
          LEFT JOIN "College" c ON u."collegeId" = c.id
          WHERE v.status = 'pending' AND u.role = 'student'
          ORDER BY v."createdAt" DESC
        `
      );
      
      return verifications.map((v: any) => ({
        id: v.id,
        userId: v.userId,
        idCardImage: v.idCardImage,
        faceImage: v.faceImage,
        status: v.status,
        matchScore: v.matchScore,
        faceMatchScore: v.faceMatchScore,
        collegeMatch: v.collegeMatch,
        analysisRemarks: v.analysisRemarks,
        createdAt: v.createdAt,
        courseMatch: null,
        courseDetected: null,
        idCardText: null,
        user: {
          id: v.user_id,
          name: v.user_name,
          email: v.user_email,
          phone: v.user_phone,
          batch: v.user_batch,
          collegeId: v.user_collegeId,
          courseId: null,
          college: v.college_id ? {
            id: v.college_id,
            name: v.college_name,
          } : null,
          course: null,
        },
      }));
    } catch (fallbackError: any) {
      console.error("Fallback query also failed:", fallbackError);
      throw new Error("Failed to fetch pending verifications");
    }
  }
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

