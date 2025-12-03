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

