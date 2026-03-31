import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  // Prisma-specific errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const field = (err.meta?.target as string[])?.join(", ") || "field";
        return res.status(409).json({ error: `Duplicate value for unique ${field}` });
      }
      case "P2025":
        return res.status(404).json({ error: "Record not found" });
      case "P2003":
        return res.status(400).json({ error: "Related record not found (foreign key constraint)" });
      case "P2014":
        return res.status(400).json({ error: "Invalid relation change" });
      default:
        return res.status(400).json({ error: "Database constraint error", code: err.code });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ error: "Invalid data provided to database" });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }

  // SyntaxError from JSON.parse in body-parser
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }

  // Custom application errors with statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Fallback 500
  const isDev = process.env.NODE_ENV !== "production";
  res.status(500).json({
    error: "Internal server error",
    ...(isDev && { details: err.message, stack: err.stack }),
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
}
