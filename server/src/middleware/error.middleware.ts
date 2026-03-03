import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errorDetails = process.env.NODE_ENV === "development" ? err.stack : undefined;

  sendError(res, message, statusCode, errorDetails);
};