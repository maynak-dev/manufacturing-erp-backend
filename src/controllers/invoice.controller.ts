import { Response } from "express";
import invoiceService from "../services/invoice.service";
import { AuthRequest } from "../middleware/auth";
import { InvoiceStatus } from "@prisma/client";

export class InvoiceController {
  async list(req: AuthRequest, res: Response) {
    try {
      const data = await invoiceService.list({
        status: req.query.status as InvoiceStatus,
        orderId: req.query.orderId as string,
      });
      res.json({ data });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const invoice = await invoiceService.findById(req.params.id);
      res.json(invoice);
    } catch (err: any) {
      res.status(err.message === "Invoice not found" ? 404 : 500).json({ error: err.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { orderId, amount } = req.body;
      if (!orderId) return res.status(400).json({ error: "orderId is required" });
      if (amount == null) return res.status(400).json({ error: "amount is required" });

      const invoice = await invoiceService.create(req.body);
      res.status(201).json(invoice);
    } catch (err: any) {
      res.status(err.message === "Order not found" ? 404 : 500).json({ error: err.message || "Failed to create invoice" });
    }
  }

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: "status is required" });
      const invoice = await invoiceService.updateStatus(req.params.id, status);
      res.json(invoice);
    } catch (err: any) {
      const status = err.message === "Invoice not found" ? 404 : err.message?.includes("Cannot transition") ? 422 : 500;
      res.status(status).json({ error: err.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const invoice = await invoiceService.update(req.params.id, req.body);
      res.json(invoice);
    } catch (err: any) {
      const status = err.message === "Invoice not found" ? 404 : err.message?.includes("Cannot update") ? 422 : 500;
      res.status(status).json({ error: err.message });
    }
  }

  async getOverdue(req: AuthRequest, res: Response) {
    try {
      const data = await invoiceService.getOverdueInvoices();
      res.json({ data });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch overdue invoices" });
    }
  }
}

export default new InvoiceController();
