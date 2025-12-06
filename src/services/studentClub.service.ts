import prisma from "../config/prisma";

export const getClubs = async (collegeId: string) => {
  try {
    const clubs = await prisma.club.findMany({
      where: { collegeId },
      include: {
        college: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return clubs;
  } catch (error) {
    console.error("Error in getClubs:", error);
    throw error;
  }
};

export const getClubById = async (clubId: string) => {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: {
      college: {
        select: {
          id: true,
          name: true,
        },
      },
      members: {
        select: {
          id: true,
          name: true,
          avatar: true,
          batch: true,
        },
      },
    },
  });

  if (!club) {
    throw new Error("Club not found");
  }

  return club;
};

export const joinClub = async (userId: string, clubId: string) => {
  // Check if club exists
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: {
      members: {
        where: { id: userId },
      },
    },
  });

  if (!club) {
    throw new Error("Club not found");
  }

  // Check if already a member
  if (club.members.length > 0) {
    throw new Error("Already a member of this club");
  }

  // Get user to verify college
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { collegeId: true },
  });

  if (!user || user.collegeId !== club.collegeId) {
    throw new Error("You can only join clubs from your college");
  }

  // Add user to club
  await prisma.club.update({
    where: { id: clubId },
    data: {
      members: {
        connect: { id: userId },
      },
    },
  });

  return { message: "Successfully joined the club" };
};

export const leaveClub = async (userId: string, clubId: string) => {
  // Check if club exists
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: {
      members: {
        where: { id: userId },
      },
    },
  });

  if (!club) {
    throw new Error("Club not found");
  }

  // Check if member
  if (club.members.length === 0) {
    throw new Error("You are not a member of this club");
  }

  // Remove user from club
  await prisma.club.update({
    where: { id: clubId },
    data: {
      members: {
        disconnect: { id: userId },
      },
    },
  });

  return { message: "Successfully left the club" };
};

