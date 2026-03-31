import { Response } from "express";
import orderService from "../services/order.service";
import { AuthRequest } from "../middleware/auth";
import { OrderStatus } from "@prisma/client";

export class OrderController {
  async list(req: AuthRequest, res: Response) {
    try {
      const result = await orderService.list({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        status: req.query.status as OrderStatus,
        companyId: req.query.companyId as string,
        search: req.query.search as string,
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const order = await orderService.findById(req.params.id);
      res.json(order);
    } catch (err: any) {
      res.status(err.message === "Order not found" ? 404 : 500).json({ error: err.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { companyId, items } = req.body;
      if (!companyId) return res.status(400).json({ error: "companyId is required" });
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "items array is required and must not be empty" });
      }

      const order = await orderService.create(req.body);
      res.status(201).json(order);
    } catch (err: any) {
      const status = err.message?.includes("not found") ? 404 : 500;
      res.status(status).json({ error: err.message || "Failed to create order" });
    }
  }

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: "status is required" });

      const order = await orderService.updateStatus(req.params.id, status);
      res.json(order);
    } catch (err: any) {
      const status = err.message === "Order not found" ? 404 : err.message?.includes("Cannot transition") ? 422 : 500;
      res.status(status).json({ error: err.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const order = await orderService.update(req.params.id, req.body);
      res.json(order);
    } catch (err: any) {
      const status = err.message === "Order not found" ? 404 : err.message?.includes("Cannot update") ? 422 : 500;
      res.status(status).json({ error: err.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await orderService.delete(req.params.id);
      res.json(result);
    } catch (err: any) {
      const status = err.message === "Order not found" ? 404 : err.message?.includes("Only") ? 422 : 500;
      res.status(status).json({ error: err.message });
    }
  }
}

export default new OrderController();
