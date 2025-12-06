import prisma from "../config/prisma";
import { CreateClubInput } from "../utils/validators/club.validators";

export const createClub = async (
  data: CreateClubInput,
  collegeId: string
) => {
  // If adminId is provided, verify the user exists and is a student
  if (data.adminId) {
    const admin = await prisma.user.findUnique({
      where: { id: data.adminId },
    });

    if (!admin) {
      throw new Error("Admin user not found");
    }

    if (admin.role !== "student") {
      throw new Error("Club admin must be a student");
    }

    if (admin.collegeId !== collegeId) {
      throw new Error("Club admin must belong to the same college");
    }
  }

  const club = await prisma.club.create({
    data: {
      name: data.name,
      description: data.description || null,
      adminId: data.adminId || null,
      collegeId,
    },
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
  });

  return club;
};

export const getClubsByCollege = async (collegeId: string) => {
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
          email: true,
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

export const updateClub = async (clubId: string, userId: string, data: { name?: string; description?: string; isPremiumOnly?: boolean }) => {
  // Check if club exists and user is admin
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { adminId: true, collegeId: true },
  });

  if (!club) {
    throw new Error("Club not found");
  }

  // Allow college admin or club admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, collegeId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isClubAdmin = club.adminId === userId;
  const isCollegeAdmin = user.role === "college_admin" && user.collegeId === club.collegeId;

  if (!isClubAdmin && !isCollegeAdmin) {
    throw new Error("Only club admin or college admin can update this club");
  }

  const updatedClub = await prisma.club.update({
    where: { id: clubId },
    data: {
      name: data.name,
      description: data.description,
      isPremiumOnly: data.isPremiumOnly,
    },
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
  });

  return updatedClub;
};

export const deleteClub = async (clubId: string, userId: string) => {
  // Check if club exists and user is admin
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { adminId: true, collegeId: true },
  });

  if (!club) {
    throw new Error("Club not found");
  }

  // Allow college admin or club admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, collegeId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isClubAdmin = club.adminId === userId;
  const isCollegeAdmin = user.role === "college_admin" && user.collegeId === club.collegeId;

  if (!isClubAdmin && !isCollegeAdmin) {
    throw new Error("Only club admin or college admin can delete this club");
  }

  await prisma.club.delete({
    where: { id: clubId },
  });

  return { message: "Club deleted successfully" };
};

export const getMyClubs = async (userId: string) => {
  const clubs = await prisma.club.findMany({
    where: { adminId: userId },
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
};

export const removeMember = async (clubId: string, memberId: string, adminId: string) => {
  // Check if user is club admin
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { adminId: true },
  });

  if (!club) {
    throw new Error("Club not found");
  }

  if (club.adminId !== adminId) {
    throw new Error("Only club admin can remove members");
  }

  // Remove member from club
  await prisma.user.update({
    where: { id: memberId },
    data: {
      clubs: {
        disconnect: { id: clubId },
      },
    },
  });

  return { message: "Member removed successfully" };
};

