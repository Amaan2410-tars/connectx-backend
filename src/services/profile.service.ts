import prisma from "../config/prisma";
import { UpdateProfileInput } from "../utils/validators/profile.validators";

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      collegeId: true,
      batch: true,
      avatar: true,
      banner: true,
      verifiedStatus: true,
      points: true,
      createdAt: true,
      college: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateProfile = async (userId: string, data: UpdateProfileInput) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.batch !== undefined && { batch: data.batch }),
      ...(data.avatar !== undefined && { avatar: data.avatar }),
      ...(data.banner !== undefined && { banner: data.banner }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      collegeId: true,
      batch: true,
      avatar: true,
      banner: true,
      verifiedStatus: true,
      points: true,
      createdAt: true,
    },
  });

  return user;
};

