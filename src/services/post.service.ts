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
  try {
    // Get user's college for filtering
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { collegeId: true },
    });

    const where: any = {};
    
    if (cursor) {
      where.id = { lt: cursor };
    }

    // Filter by user's college if they have one
    if (user?.collegeId) {
      where.user = {
        collegeId: user.collegeId,
      };
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
            isPremium: true,
            premiumBadge: true,
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
  } catch (error) {
    console.error("Error in getFeed:", error);
    throw error;
  }
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

export const getPostComments = async (postId: string, limit: number = 20, cursor?: string) => {
  const where = cursor
    ? {
        postId,
        id: { lt: cursor },
      }
    : { postId };

  const comments = await prisma.comment.findMany({
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
    },
  });

  let nextCursor: string | undefined = undefined;
  let hasMore = false;
  
  if (comments.length > limit) {
    const nextItem = comments.pop();
    nextCursor = nextItem?.id;
    hasMore = true;
  }

  return {
    comments,
    nextCursor,
    hasMore,
  };
};

export const updatePost = async (userId: string, postId: string, data: { caption?: string; image?: string }) => {
  // Check if post exists and belongs to user
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.userId !== userId) {
    throw new Error("You can only edit your own posts");
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      caption: data.caption !== undefined ? data.caption : undefined,
      image: data.image !== undefined ? data.image : undefined,
    },
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

  return updatedPost;
};

export const deletePostByOwner = async (userId: string, postId: string) => {
  // Check if post exists and belongs to user
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.userId !== userId) {
    throw new Error("You can only delete your own posts");
  }

  // Delete post (cascade will handle likes and comments)
  await prisma.post.delete({
    where: { id: postId },
  });

  return { message: "Post deleted successfully" };
};

export const updateComment = async (userId: string, commentId: string, text: string) => {
  // Check if comment exists and belongs to user
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId !== userId) {
    throw new Error("You can only edit your own comments");
  }

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { text },
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

  return updatedComment;
};

export const deleteComment = async (userId: string, commentId: string) => {
  // Check if comment exists and belongs to user
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId !== userId) {
    throw new Error("You can only delete your own comments");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return { message: "Comment deleted successfully" };
};

