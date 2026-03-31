import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import prisma from "../utils/prisma";

type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

const METHOD_ACTION: Record<HttpMethod, string> = {
  POST: "CREATE",
  PUT: "UPDATE",
  PATCH: "UPDATE",
  DELETE: "DELETE",
};

// Map URL path segments to entity names
function extractEntity(url: string): { entity: string; entityId?: string } {
  const parts = url.replace(/^\/api\//, "").split("/").filter(Boolean);
  // e.g. ["orders", "abc-123"] or ["purchase-orders", "abc-123", "status"]
  const entityRaw = parts[0] || "unknown";
  const entity = entityRaw
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  const entityId = parts[1] && !parts[1].startsWith("?") ? parts[1] : undefined;
  return { entity, entityId };
}

/**
 * Middleware that records write operations (POST/PUT/PATCH/DELETE) to the
 * activity_logs table. Attach AFTER authenticate so req.user is available.
 */
export function activityLogger(req: AuthRequest, res: Response, next: NextFunction) {
  const method = req.method as HttpMethod;
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return next();

  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    // Fire-and-forget — never block the response
    if (req.user && res.statusCode < 400) {
      const action = METHOD_ACTION[method];
      const { entity, entityId } = extractEntity(req.originalUrl);
      const resolvedId = entityId || body?.id;

      prisma.activityLog
        .create({
          data: {
            userId: req.user.id,
            action,
            entity,
            entityId: resolvedId,
            details: method === "DELETE" ? undefined : JSON.stringify(body).slice(0, 500),
          },
        })
        .catch((err) => console.error("[ActivityLogger] Failed to write log:", err));
    }
    return originalJson(body);
  };

  next();
}
