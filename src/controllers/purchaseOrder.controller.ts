import { Response } from "express";
import purchaseOrderService from "../services/purchaseOrder.service";
import { AuthRequest } from "../middleware/auth";
import { PurchaseOrderStatus } from "@prisma/client";

export class PurchaseOrderController {
  async list(req: AuthRequest, res: Response) {
    try {
      const data = await purchaseOrderService.list({
        status: req.query.status as PurchaseOrderStatus,
        vendorId: req.query.vendorId as string,
      });
      res.json({ data });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const po = await purchaseOrderService.findById(req.params.id);
      res.json(po);
    } catch (err: any) {
      res.status(err.message === "Purchase order not found" ? 404 : 500).json({ error: err.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.body.vendorId) return res.status(400).json({ error: "vendorId is required" });
      const po = await purchaseOrderService.create(req.body);
      res.status(201).json(po);
    } catch (err: any) {
      res.status(err.message === "Vendor not found" ? 404 : 500).json({ error: err.message || "Failed to create purchase order" });
    }
  }

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: "status is required" });
      const po = await purchaseOrderService.updateStatus(req.params.id, status);
      res.json(po);
    } catch (err: any) {
      const status = err.message === "Purchase order not found" ? 404 : err.message?.includes("Cannot transition") ? 422 : 500;
      res.status(status).json({ error: err.message });
    }
  }

  async markReceived(req: AuthRequest, res: Response) {
    try {
      const po = await purchaseOrderService.markReceived(req.params.id, req.body);
      res.json(po);
    } catch (err: any) {
      const status = err.message === "Purchase order not found" ? 404 : err.message?.includes("Only") ? 422 : 500;
      res.status(status).json({ error: err.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const po = await purchaseOrderService.update(req.params.id, req.body);
      res.json(po);
    } catch (err: any) {
      const status = err.message === "Purchase order not found" ? 404 : err.message?.includes("Cannot update") ? 422 : 500;
      res.status(status).json({ error: err.message });
    }
  }
}

export default new PurchaseOrderController();
