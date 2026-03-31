import { Request, Response, NextFunction } from "express";

type Rule =
  | { required: true; type?: string; min?: number; max?: number; enum?: string[] }
  | { required?: false; type?: string; min?: number; max?: number; enum?: string[] };

type Schema = Record<string, Rule>;

/**
 * Lightweight schema-based request body validator.
 * Usage: router.post("/", validate({ name: { required: true, type: "string" } }), controller.create)
 */
export function validate(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const [field, rule] of Object.entries(schema)) {
      const value = req.body[field];
      const missing = value === undefined || value === null || value === "";

      if (rule.required && missing) {
        errors.push(`${field} is required`);
        continue;
      }

      if (missing) continue; // optional, not present — skip further checks

      if (rule.type) {
        const actualType = Array.isArray(value) ? "array" : typeof value;
        if (actualType !== rule.type) {
          errors.push(`${field} must be of type ${rule.type}`);
          continue;
        }
      }

      if (typeof value === "number") {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(`${field} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(`${field} must be at most ${rule.max}`);
        }
      }

      if (typeof value === "string" && rule.enum && !rule.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rule.enum.join(", ")}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    next();
  };
}

// --- Reusable validation schemas ---

export const registerSchema: Schema = {
  email: { required: true, type: "string" },
  password: { required: true, type: "string", min: 6 },
  name: { required: true, type: "string" },
  role: { enum: ["ADMIN", "SALES", "PRODUCTION", "PROCUREMENT", "FINANCE"] },
};

export const loginSchema: Schema = {
  email: { required: true, type: "string" },
  password: { required: true, type: "string" },
};

export const orderSchema: Schema = {
  companyId: { required: true, type: "string" },
  items: { required: true, type: "array" },
};

export const inventorySchema: Schema = {
  productId: { required: true, type: "string" },
  type: { required: true, enum: ["RAW_MATERIAL", "WIP", "FINISHED_GOOD"] },
  quantity: { required: true, type: "number", min: 0 },
};

export const paymentSchema: Schema = {
  invoiceId: { required: true, type: "string" },
  amount: { required: true, type: "number", min: 0.01 },
  status: { enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"] },
};
