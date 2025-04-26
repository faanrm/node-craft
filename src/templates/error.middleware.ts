import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { logger } from "../utils/logger";

export enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER = 500,
}

export interface ApiError {
  message: string;
  code: string;
  status: HttpStatusCode;
  errors?: Record<string, any>;
  stack?: string;
}

class AppError extends Error {
  public readonly code: string;
  public readonly status: HttpStatusCode;
  public readonly errors?: Record<string, any>;

  constructor(
    message: string,
    status: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER,
    code: string = "INTERNAL_ERROR",
    errors?: Record<string, any>,
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(
    message: string,
    code: string = "BAD_REQUEST",
    errors?: Record<string, any>,
  ) {
    super(message, HttpStatusCode.BAD_REQUEST, code, errors);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code: string = "NOT_FOUND") {
    super(message, HttpStatusCode.NOT_FOUND, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, code: string = "UNAUTHORIZED") {
    super(message, HttpStatusCode.UNAUTHORIZED, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, code: string = "FORBIDDEN") {
    super(message, HttpStatusCode.FORBIDDEN, code);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let apiError: ApiError;

  logger.error(`${req.method} ${req.path} - Error: ${err.message}`, {
    error: err.stack,
    requestId: req.headers["x-request-id"],
    userId: req.user?.id,
  });

  if (err instanceof ZodError) {
    apiError = {
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      status: HttpStatusCode.BAD_REQUEST,
      errors: err.errors.reduce(
        (acc, curr) => {
          const key = curr.path.join(".");
          acc[key] = curr.message;
          return acc;
        },
        {} as Record<string, string>,
      ),
    };
  } else if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        apiError = {
          message: "Unique constraint violation",
          code: "UNIQUE_CONSTRAINT_VIOLATION",
          status: HttpStatusCode.BAD_REQUEST,
          errors: {
            fields: err.meta?.target || "unknown",
          },
        };
        break;
      case "P2025":
        apiError = {
          message: "Record not found",
          code: "NOT_FOUND",
          status: HttpStatusCode.NOT_FOUND,
        };
        break;
      default:
        apiError = {
          message: "Database error",
          code: `PRISMA_${err.code}`,
          status: HttpStatusCode.INTERNAL_SERVER,
        };
    }
  } else if (err instanceof AppError) {
    apiError = {
      message: err.message,
      code: err.code,
      status: err.status,
      errors: err.errors,
    };
  } else {
    apiError = {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
      status: HttpStatusCode.INTERNAL_SERVER,
    };
  }

  if (process.env.NODE_ENV === "development") {
    apiError.stack = err.stack;
  }

  res.status(apiError.status).json({
    error: {
      message: apiError.message,
      code: apiError.code,
      errors: apiError.errors,
    },
    timestamp: new Date().toISOString(),
  });
};

export { AppError };
