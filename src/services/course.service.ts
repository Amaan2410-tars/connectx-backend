import prisma from "../config/prisma";

export const getCoursesByCollege = async (collegeId: string) => {
  const courses = await prisma.course.findMany({
    where: { collegeId },
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: { name: "asc" },
  });

  return courses;
};

export const createCourse = async (data: { name: string; code?: string; collegeId: string }) => {
  const course = await prisma.course.create({
    data: {
      name: data.name,
      code: data.code,
      collegeId: data.collegeId,
    },
    select: {
      id: true,
      name: true,
      code: true,
      collegeId: true,
      createdAt: true,
    },
  });

  return course;
};

