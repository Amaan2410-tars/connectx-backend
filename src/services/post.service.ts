import prisma from "../config/prisma";
import { CreatePostInput } from "../utils/validators/post.validators";

export const createPost = async (userId: string, data: CreatePostInput) => {
  const post = await prisma.post.create({
    data: {
      userId,
      caption: data.caption || null,
      image: data.image || null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
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

  return post;
};

export const getFeed = async (userId: string, limit: number = 20, cursor?: string) => {
  const where = cursor
    ? {
        id: { lt: cursor },
      }
    : {};

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
      likes: {
        where: { userId },
        select: { id: true },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  let nextCursor: string | undefined = undefined;
  let hasMore = false;
  
  if (posts.length > limit) {
    const nextItem = posts.pop();
    nextCursor = nextItem?.id;
    hasMore = true;
  }

  return {
    posts,
    nextCursor,
    hasMore,
  };
};

export const likePost = async (userId: string, postId: string) => {
  // Check if already liked
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (existingLike) {
    throw new Error("Post already liked");
  }

  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const like = await prisma.like.create({
    data: {
      userId,
      postId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return like;
};

export const unlikePost = async (userId: string, postId: string) => {
  const like = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (!like) {
    throw new Error("Post not liked");
  }

  await prisma.like.delete({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  return { message: "Post unliked successfully" };
};

export const commentOnPost = async (userId: string, postId: string, text: string) => {
  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const comment = await prisma.comment.create({
    data: {
      userId,
      postId,
      text,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  return comment;
};

export const getPostComments = async (postId: string, limit: number = 20) => {
  const comments = await prisma.comment.findMany({
    where: { postId },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  return comments;
};

