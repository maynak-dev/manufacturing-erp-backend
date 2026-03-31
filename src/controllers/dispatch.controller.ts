import { Response } from "express";
import dispatchService from "../services/dispatch.service";
import { AuthRequest } from "../middleware/auth";
import { DispatchStatus } from "@prisma/client";

export class DispatchController {
  async list(req: AuthRequest, res: Response) {
    try {
      const data = await dispatchService.list({
        orderId: req.query.orderId as string,
      });
      res.json({ data });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch dispatches" });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const dispatch = await dispatchService.findById(req.params.id);
      res.json(dispatch);
    } catch (err: any) {
      res.status(err.message === "Dispatch not found" ? 404 : 500).json({ error: err.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.body.orderId) return res.status(400).json({ error: "orderId is required" });

      const dispatch = await dispatchService.create(req.body);
      res.status(201).json(dispatch);
    } catch (err: any) {
      const status =
        err.message === "Order not found" ? 404
        : err.message?.includes("must be COMPLETED") ? 422
        : 500;
      res.status(status).json({ error: err.message || "Failed to create dispatch" });
    }
  }

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: "status is required" });
      const dispatch = await dispatchService.updateStatus(req.params.id, status as DispatchStatus);
      res.json(dispatch);
    } catch (err: any) {
      const status = err.message === "Dispatch not found" ? 404 : err.message?.includes("Cannot transition") ? 422 : 500;
      res.status(status).json({ error: err.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const dispatch = await dispatchService.update(req.params.id, req.body);
      res.json(dispatch);
    } catch (err: any) {
      res.status(err.message === "Dispatch not found" ? 404 : 500).json({ error: err.message });
    }
  }
}

export default new DispatchController();
