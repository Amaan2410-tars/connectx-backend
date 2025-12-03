import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

export const validate =
  (schema: ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues || [];
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: issues.map((err: any) => ({
            path: err.path?.join(".") || "",
            message: err.message || "Validation failed",
          })),
        });
      }
      next(error);
    }
  };

