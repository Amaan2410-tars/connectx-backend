import prisma from "../config/prisma";

export const getEvents = async (collegeId: string) => {
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
              avatar: true,
            },
          },
        },
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

export const rsvpEvent = async (userId: string, eventId: string) => {
  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      attendees: {
        where: { userId },
      },
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // Check if already RSVP'd
  if (event.attendees.length > 0) {
    throw new Error("Already RSVP'd to this event");
  }

  // Get user to verify college
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { collegeId: true },
  });

  if (!user || user.collegeId !== event.collegeId) {
    throw new Error("You can only RSVP to events from your college");
  }

  // Create RSVP
  await prisma.eventsOnUsers.create({
    data: {
      userId,
      eventId,
    },
  });

  return { message: "Successfully RSVP'd to the event" };
};

export const cancelRSVP = async (userId: string, eventId: string) => {
  // Check if RSVP exists
  const rsvp = await prisma.eventsOnUsers.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  if (!rsvp) {
    throw new Error("You have not RSVP'd to this event");
  }

  // Delete RSVP
  await prisma.eventsOnUsers.delete({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  return { message: "Successfully cancelled RSVP" };
};

