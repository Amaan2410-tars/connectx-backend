import prisma from "../config/prisma";

export const getSuperAdminAnalytics = async () => {
  // Total counts
  const [
    totalColleges,
    totalStudents,
    totalPosts,
    totalVerifications,
    totalCollegeAdmins,
  ] = await Promise.all([
    prisma.college.count(),
    prisma.user.count({ where: { role: "student" } }),
    prisma.post.count(),
    prisma.verification.count(),
    prisma.user.count({ where: { role: "college_admin" } }),
  ]);

  // Daily signups (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailySignups = await prisma.user.groupBy({
    by: ["createdAt"],
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
      role: "student",
    },
    _count: {
      id: true,
    },
  });

  // Format daily signups
  const signupsByDate = dailySignups.reduce((acc, item) => {
    const date = new Date(item.createdAt).toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + item._count.id;
    return acc;
  }, {} as Record<string, number>);

  // Verification stats
  const verificationStats = await prisma.verification.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });

  const verificationStatsMap = verificationStats.reduce((acc, item) => {
    acc[item.status] = item._count.id;
    return acc;
  }, {} as Record<string, number>);

  // Recent activity (last 10 signups)
  const recentSignups = await prisma.user.findMany({
    where: {
      role: "student",
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      college: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    totals: {
      colleges: totalColleges,
      students: totalStudents,
      posts: totalPosts,
      verifications: totalVerifications,
      collegeAdmins: totalCollegeAdmins,
    },
    dailySignups: signupsByDate,
    verificationStats: {
      pending: verificationStatsMap.pending || 0,
      approved: verificationStatsMap.approved || 0,
      rejected: verificationStatsMap.rejected || 0,
    },
    recentSignups,
  };
};

