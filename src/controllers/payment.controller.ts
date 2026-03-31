import { Response } from "express";
import paymentService from "../services/payment.service";
import { AuthRequest } from "../middleware/auth";
import { PaymentStatus } from "@prisma/client";

export class PaymentController {
  async list(req: AuthRequest, res: Response) {
    try {
      const data = await paymentService.list({
        invoiceId: req.query.invoiceId as string,
      });
      res.json({ data });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const payment = await paymentService.findById(req.params.id);
      res.json(payment);
    } catch (err: any) {
      res.status(err.message === "Payment not found" ? 404 : 500).json({ error: err.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { invoiceId, amount } = req.body;
      if (!invoiceId) return res.status(400).json({ error: "invoiceId is required" });
      if (amount == null || amount <= 0) return res.status(400).json({ error: "amount must be a positive number" });

      const payment = await paymentService.create(req.body);
      res.status(201).json(payment);
    } catch (err: any) {
      const status =
        err.message === "Invoice not found" ? 404
        : err.message?.includes("already paid") || err.message?.includes("cancelled") || err.message?.includes("exceeds") ? 422
        : 500;
      res.status(status).json({ error: err.message || "Failed to create payment" });
    }
  }

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: "status is required" });
      const payment = await paymentService.updateStatus(req.params.id, status as PaymentStatus);
      res.json(payment);
    } catch (err: any) {
      res.status(err.message === "Payment not found" ? 404 : 500).json({ error: err.message });
    }
  }
}

export default new PaymentController();
