import prisma from "../config/prisma";

export const getCollegeAdminAnalytics = async (collegeId: string) => {
  // Active students (students with at least one post)
  const activeStudents = await prisma.user.count({
    where: {
      collegeId,
      role: "student",
      posts: { some: {} },
    },
  });

  // Total students
  const totalStudents = await prisma.user.count({
    where: {
      collegeId,
      role: "student",
    },
  });

  // Events count
  const eventsCount = await prisma.event.count({
    where: { collegeId },
  });

  // Upcoming events
  const upcomingEvents = await prisma.event.count({
    where: {
      collegeId,
      date: { gte: new Date() },
    },
  });

  // Clubs count
  const clubsCount = await prisma.club.count({
    where: { collegeId },
  });

  // Verification stats
  const verificationStats = await prisma.verification.groupBy({
    by: ["status"],
    where: {
      user: {
        collegeId,
        role: "student",
      },
    },
    _count: {
      id: true,
    },
  });

  const verificationStatsMap = verificationStats.reduce((acc, item) => {
    acc[item.status] = item._count.id;
    return acc;
  }, {} as Record<string, number>);

  // Total posts from students in this college
  const totalPosts = await prisma.post.count({
    where: {
      user: {
        collegeId,
        role: "student",
      },
    },
  });

  // Recent activity (last 5 signups)
  const recentSignups = await prisma.user.findMany({
    where: {
      collegeId,
      role: "student",
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      verifiedStatus: true,
    },
  });

  return {
    students: {
      total: totalStudents,
      active: activeStudents,
    },
    events: {
      total: eventsCount,
      upcoming: upcomingEvents,
    },
    clubs: {
      total: clubsCount,
    },
    verifications: {
      pending: verificationStatsMap.pending || 0,
      approved: verificationStatsMap.approved || 0,
      rejected: verificationStatsMap.rejected || 0,
    },
    posts: {
      total: totalPosts,
    },
    recentSignups,
  };
};

