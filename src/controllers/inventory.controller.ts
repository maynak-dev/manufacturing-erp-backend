import { Response } from "express";
import inventoryService from "../services/inventory.service";
import { AuthRequest } from "../middleware/auth";
import { InventoryType } from "@prisma/client";

export class InventoryController {
  async list(req: AuthRequest, res: Response) {
    try {
      const data = await inventoryService.list({
        type: req.query.type as InventoryType,
        productId: req.query.productId as string,
        lowStock: req.query.lowStock === "true",
      });
      res.json({ data });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const item = await inventoryService.findById(req.params.id);
      res.json(item);
    } catch (err: any) {
      res.status(err.message?.includes("not found") ? 404 : 500).json({ error: err.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { productId, type, quantity } = req.body;
      if (!productId) return res.status(400).json({ error: "productId is required" });
      if (!type) return res.status(400).json({ error: "type is required" });
      if (quantity == null) return res.status(400).json({ error: "quantity is required" });

      const item = await inventoryService.create(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(err.message === "Product not found" ? 404 : 500).json({ error: err.message || "Failed to create inventory record" });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const item = await inventoryService.update(req.params.id, req.body);
      res.json(item);
    } catch (err: any) {
      res.status(err.message?.includes("not found") ? 404 : 500).json({ error: err.message });
    }
  }

  async adjustQuantity(req: AuthRequest, res: Response) {
    try {
      const { delta, reason } = req.body;
      if (delta == null || typeof delta !== "number") {
        return res.status(400).json({ error: "delta (number) is required" });
      }
      const item = await inventoryService.adjustQuantity(req.params.id, delta, reason);
      res.json(item);
    } catch (err: any) {
      const status = err.message?.includes("not found") ? 404 : err.message?.includes("negative") ? 422 : 500;
      res.status(status).json({ error: err.message });
    }
  }

  async getLowStockAlerts(req: AuthRequest, res: Response) {
    try {
      const data = await inventoryService.getLowStockAlerts();
      res.json({ data });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch low stock alerts" });
    }
  }

  async getSummary(req: AuthRequest, res: Response) {
    try {
      const summary = await inventoryService.getSummary();
      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch inventory summary" });
    }
  }
}

export default new InventoryController();
