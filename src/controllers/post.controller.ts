import { Request, Response, NextFunction } from "express";
import {
  createPost,
  getFeed,
  likePost,
  unlikePost,
  commentOnPost,
  getPostComments,
} from "../services/post.service";
import { AppError } from "../middleware/errorHandler";
import { processUploadedFile } from "../services/fileUpload.service";

export const createPostHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    // Check if image was uploaded
    let imageUrl = req.body.image;
    if (req.file) {
      const uploadedFile = processUploadedFile(req.file);
      imageUrl = uploadedFile.url;
    }

    const post = await createPost(req.user.userId, {
      caption: req.body.caption,
      image: imageUrl,
    });
    
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const getFeedHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const cursor = req.query.cursor as string | undefined;

    const feed = await getFeed(req.user.userId, limit, cursor);
    res.status(200).json({
      success: true,
      data: feed,
    });
  } catch (error) {
    next(error);
  }
};

export const likePostHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const like = await likePost(req.user.userId, id);
    res.status(200).json({
      success: true,
      message: "Post liked successfully",
      data: like,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "Post not found" ? 404 : 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const unlikePostHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const result = await unlikePost(req.user.userId, id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const commentOnPostHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const { text } = req.body;
    const comment = await commentOnPost(req.user.userId, id, text);
    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: comment,
    });
  } catch (error) {
    if (error instanceof Error) {
      const appError: AppError = error;
      appError.statusCode = error.message === "Post not found" ? 404 : 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

export const getPostCommentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const comments = await getPostComments(id, limit);
    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

