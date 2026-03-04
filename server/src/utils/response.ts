import { Response } from "express";
import { IApiResponse } from "../../../shared/models/IApiResponse";

/**
 * Send a successful response
 * @param res - Express Response object
 * @param data - Data to send in response
 * @param message - Success message (optional)
 * @param statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = <T = any>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200
): Response<IApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    statusCode,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send an error response
 * @param res - Express Response object
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 500)
 * @param error - Additional error details (optional)
 */
export const sendError = (
  res: Response,
  message: string = "Internal Server Error",
  statusCode: number = 500,
  error?: string
): Response<IApiResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
    statusCode,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Response helper class with static methods
 */
export class ResponseHelper {
  static success<T = any>(
    res: Response,
    data: T,
    message: string = "Success",
    statusCode: number = 200
  ): Response<IApiResponse<T>> {
    return sendSuccess(res, data, message, statusCode);
  }

  static error(
    res: Response,
    message: string = "Internal Server Error",
    statusCode: number = 500,
    error?: string
  ): Response<IApiResponse> {
    return sendError(res, message, statusCode, error);
  }

  static created<T = any>(
    res: Response,
    data: T,
    message: string = "Resource created successfully"
  ): Response<IApiResponse<T>> {
    return sendSuccess(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static badRequest(
    res: Response,
    message: string = "Bad Request",
    error?: string
  ): Response<IApiResponse> {
    return sendError(res, message, 400, error);
  }

  static unauthorized(
    res: Response,
    message: string = "Unauthorized"
  ): Response<IApiResponse> {
    return sendError(res, message, 401);
  }

  static forbidden(
    res: Response,
    message: string = "Forbidden"
  ): Response<IApiResponse> {
    return sendError(res, message, 403);
  }

  static notFound(
    res: Response,
    message: string = "Resource not found"
  ): Response<IApiResponse> {
    return sendError(res, message, 404);
  }

  static conflict(
    res: Response,
    message: string = "Conflict"
  ): Response<IApiResponse> {
    return sendError(res, message, 409);
  }

  static internalError(
    res: Response,
    message: string = "Internal Server Error",
    error?: string
  ): Response<IApiResponse> {
    return sendError(res, message, 500, error);
  }
}
