import prisma from "../config/prisma";

export interface SearchOptions {
  query: string;
  type?: "users" | "posts" | "clubs" | "events" | "all";
  limit?: number;
  cursor?: string;
  collegeId?: string;
}

export const searchUsers = async (query: string, limit: number = 20, cursor?: string, collegeId?: string) => {
  const searchTerm = `%${query.toLowerCase()}%`;
  const where: any = {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { username: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ],
    role: "student",
  };

  if (collegeId) {
    where.collegeId = collegeId;
  }

  if (cursor) {
    where.id = { lt: cursor };
  }

  const users = await prisma.user.findMany({
    where,
    take: limit + 1,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      avatar: true,
      collegeId: true,
      verifiedStatus: true,
      isPremium: true,
      college: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const hasMore = users.length > limit;
  const data = hasMore ? users.slice(0, limit) : users;
  const nextCursor = hasMore ? data[data.length - 1].id : undefined;

  return {
    users: data,
    nextCursor,
    hasMore,
  };
};

export const searchPosts = async (query: string, limit: number = 20, cursor?: string, collegeId?: string) => {
  const where: any = {
    OR: [
      { caption: { contains: query, mode: "insensitive" } },
    ],
  };

  if (collegeId) {
    where.user = {
      collegeId,
    };
  }

  if (cursor) {
    where.id = { lt: cursor };
  }

  const posts = await prisma.post.findMany({
    where,
    take: limit + 1,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  const hasMore = posts.length > limit;
  const data = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? data[data.length - 1].id : undefined;

  return {
    posts: data,
    nextCursor,
    hasMore,
  };
};

export const searchClubs = async (query: string, limit: number = 20, cursor?: string, collegeId?: string) => {
  const where: any = {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ],
  };

  if (collegeId) {
    where.collegeId = collegeId;
  }

  if (cursor) {
    where.id = { lt: cursor };
  }

  const clubs = await prisma.club.findMany({
    where,
    take: limit + 1,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  const hasMore = clubs.length > limit;
  const data = hasMore ? clubs.slice(0, limit) : clubs;
  const nextCursor = hasMore ? data[data.length - 1].id : undefined;

  return {
    clubs: data,
    nextCursor,
    hasMore,
  };
};

export const searchEvents = async (query: string, limit: number = 20, cursor?: string, collegeId?: string) => {
  const where: any = {
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ],
  };

  if (collegeId) {
    where.collegeId = collegeId;
  }

  if (cursor) {
    where.id = { lt: cursor };
  }

  const events = await prisma.event.findMany({
    where,
    take: limit + 1,
    orderBy: { date: "asc" },
    include: {
      _count: {
        select: {
          attendees: true,
        },
      },
    },
  });

  const hasMore = events.length > limit;
  const data = hasMore ? events.slice(0, limit) : events;
  const nextCursor = hasMore ? data[data.length - 1].id : undefined;

  return {
    events: data,
    nextCursor,
    hasMore,
  };
};

export const searchAll = async (options: SearchOptions) => {
  const { query, limit = 10, collegeId } = options;

  const [users, posts, clubs, events] = await Promise.all([
    searchUsers(query, limit, undefined, collegeId),
    searchPosts(query, limit, undefined, collegeId),
    searchClubs(query, limit, undefined, collegeId),
    searchEvents(query, limit, undefined, collegeId),
  ]);

  return {
    users: users.users,
    posts: posts.posts,
    clubs: clubs.clubs,
    events: events.events,
  };
};

