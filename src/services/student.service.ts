import prisma from "../config/prisma";

export const getStudentsByCollege = async (collegeId: string) => {
  const students = await prisma.user.findMany({
    where: {
      collegeId,
      role: "student",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      batch: true,
      avatar: true,
      verifiedStatus: true,
      points: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          eventsRSVP: true,
          clubs: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return students;
};

export const getStudentStats = async (collegeId: string) => {
  const [
    totalStudents,
    verifiedStudents,
    pendingVerifications,
    activeStudents,
  ] = await Promise.all([
    prisma.user.count({
      where: { collegeId, role: "student" },
    }),
    prisma.user.count({
      where: { collegeId, role: "student", verifiedStatus: "approved" },
    }),
    prisma.verification.count({
      where: {
        user: { collegeId, role: "student" },
        status: "pending",
      },
    }),
    prisma.user.count({
      where: {
        collegeId,
        role: "student",
        posts: { some: {} }, // Has at least one post
      },
    }),
  ]);

  return {
    total: totalStudents,
    verified: verifiedStudents,
    pendingVerifications,
    active: activeStudents,
  };
};

