import { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
  windowMs: number;   // time window in milliseconds
  max: number;        // max requests per window
  message?: string;
}

interface HitRecord {
  count: number;
  resetAt: number;
}

// In-memory store — swap with Redis in production for multi-instance deployments
const store = new Map<string, HitRecord>();

export function rateLimiter(options: RateLimitOptions) {
  const { windowMs, max, message = "Too many requests, please try again later." } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const record = store.get(key);

    if (!record || now > record.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", 0);
      return res.status(429).json({ error: message, retryAfter });
    }

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", max - record.count);
    next();
  };
}

// Pre-configured limiters for common use-cases
export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: "Too many login attempts. Please try again in 15 minutes.",
});

export const apiLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
});
