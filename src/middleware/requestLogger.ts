import { Request, Response, NextFunction } from "express";

type LogLevel = "info" | "warn" | "error";

function colorize(level: LogLevel, text: string): string {
  const colors: Record<LogLevel, string> = {
    info: "\x1b[36m",   // cyan
    warn: "\x1b[33m",   // yellow
    error: "\x1b[31m",  // red
  };
  const reset = "\x1b[0m";
  return `${colors[level]}${text}${reset}`;
}

function statusLevel(status: number): LogLevel {
  if (status >= 500) return "error";
  if (status >= 400) return "warn";
  return "info";
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on("finish", () => {
    const ms = Date.now() - start;
    const { statusCode } = res;
    const level = statusLevel(statusCode);

    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] ${method} ${originalUrl} ${statusCode} ${ms}ms — ${ip}`;

    if (process.env.NODE_ENV !== "test") {
      console.log(colorize(level, log));
    }
  });

  next();
}
