import prisma from "../config/prisma";
import { CreateEventInput } from "../utils/validators/event.validators";

export const createEvent = async (
  data: CreateEventInput,
  collegeId: string
) => {
  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description || null,
      date: typeof data.date === "string" ? new Date(data.date) : data.date,
      image: data.image || null,
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
          attendees: true,
        },
      },
    },
  });

  return event;
};

export const getEventsByCollege = async (collegeId: string) => {
  const events = await prisma.event.findMany({
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
          attendees: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  return events;
};

export const getEventById = async (eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      college: {
        select: {
          id: true,
          name: true,
        },
      },
      attendees: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        take: 10,
      },
      _count: {
        select: {
          attendees: true,
        },
      },
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  return event;
};

