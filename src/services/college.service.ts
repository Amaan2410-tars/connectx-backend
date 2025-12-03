import prisma from "../config/prisma";
import { CreateCollegeInput, UpdateCollegeInput } from "../utils/validators/college.validators";

export const createCollege = async (data: CreateCollegeInput, createdBy: string) => {
  // Check if slug already exists
  const existingCollege = await prisma.college.findUnique({
    where: { slug: data.slug },
  });

  if (existingCollege) {
    throw new Error("College with this slug already exists");
  }

  const college = await prisma.college.create({
    data: {
      name: data.name,
      slug: data.slug,
      logo: data.logo || null,
      city: data.city || null,
      website: data.website || null,
      createdBy,
    },
  });

  return college;
};

export const getAllColleges = async () => {
  const colleges = await prisma.college.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          users: true,
          clubs: true,
          events: true,
        },
      },
    },
  });

  return colleges;
};

export const getCollegeById = async (id: string) => {
  const college = await prisma.college.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          clubs: true,
          events: true,
        },
      },
    },
  });

  if (!college) {
    throw new Error("College not found");
  }

  return college;
};

export const updateCollege = async (id: string, data: UpdateCollegeInput) => {
  // Check if college exists
  const existingCollege = await prisma.college.findUnique({
    where: { id },
  });

  if (!existingCollege) {
    throw new Error("College not found");
  }

  // If slug is being updated, check if new slug exists
  if (data.slug && data.slug !== existingCollege.slug) {
    const slugExists = await prisma.college.findUnique({
      where: { slug: data.slug },
    });

    if (slugExists) {
      throw new Error("College with this slug already exists");
    }
  }

  const college = await prisma.college.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.logo !== undefined && { logo: data.logo }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.website !== undefined && { website: data.website }),
    },
  });

  return college;
};

export const deleteCollege = async (id: string) => {
  // Check if college exists
  const existingCollege = await prisma.college.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          clubs: true,
          events: true,
        },
      },
    },
  });

  if (!existingCollege) {
    throw new Error("College not found");
  }

  // Check if college has associated data
  if (existingCollege._count.users > 0 || existingCollege._count.clubs > 0 || existingCollege._count.events > 0) {
    throw new Error("Cannot delete college with associated users, clubs, or events");
  }

  await prisma.college.delete({
    where: { id },
  });

  return { message: "College deleted successfully" };
};

