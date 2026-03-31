import { Response } from "express";
import workOrderService from "../services/workOrder.service";
import { AuthRequest } from "../middleware/auth";
import { WorkOrderStatus } from "@prisma/client";

export class WorkOrderController {
  async list(req: AuthRequest, res: Response) {
    try {
      const data = await workOrderService.list({
        status: req.query.status as WorkOrderStatus,
        orderId: req.query.orderId as string,
      });
      res.json({ data });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch work orders" });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const wo = await workOrderService.findById(req.params.id);
      res.json(wo);
    } catch (err: any) {
      res.status(err.message === "Work order not found" ? 404 : 500).json({ error: err.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { orderId } = req.body;
      if (!orderId) return res.status(400).json({ error: "orderId is required" });

      const wo = await workOrderService.create(req.body);
      res.status(201).json(wo);
    } catch (err: any) {
      const status = err.message?.includes("not found") ? 404 : err.message?.includes("Cannot create") ? 422 : 500;
      res.status(status).json({ error: err.message || "Failed to create work order" });
    }
  }

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: "status is required" });

      const wo = await workOrderService.updateStatus(req.params.id, status);
      res.json(wo);
    } catch (err: any) {
      const status = err.message === "Work order not found" ? 404 : err.message?.includes("Cannot transition") ? 422 : 500;
      res.status(status).json({ error: err.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const wo = await workOrderService.update(req.params.id, req.body);
      res.json(wo);
    } catch (err: any) {
      res.status(err.message === "Work order not found" ? 404 : 500).json({ error: err.message });
    }
  }
}

export default new WorkOrderController();
