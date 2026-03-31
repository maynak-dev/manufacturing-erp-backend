import prisma from "../utils/prisma";
import { InvoiceStatus } from "@prisma/client";

interface InvoiceData {
  orderId: string;
  amount: number;
  dueDate?: Date;
}

export class InvoiceService {
  async list({ status, orderId }: { status?: InvoiceStatus; orderId?: string } = {}) {
    const where: any = {};
    if (status) where.status = status;
    if (orderId) where.orderId = orderId;
    return prisma.invoice.findMany({
      where,
      include: { order: { include: { company: true } }, payments: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { order: { include: { company: true, contact: true } }, payments: true },
    });
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  }

  async create(data: InvoiceData) {
    const order = await prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) throw new Error("Order not found");

    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(count + 1).padStart(5, "0")}`;
    return prisma.invoice.create({
      data: { ...data, invoiceNumber },
      include: { order: { include: { company: true } } },
    });
  }

  async updateStatus(id: string, status: InvoiceStatus) {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new Error("Invoice not found");

    const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
      DRAFT: ["SENT", "CANCELLED"],
      SENT: ["PAID", "OVERDUE", "CANCELLED"],
      OVERDUE: ["PAID", "CANCELLED"],
      PAID: [],
      CANCELLED: [],
    };
    if (!validTransitions[invoice.status].includes(status)) {
      throw new Error(`Cannot transition from ${invoice.status} to ${status}`);
    }
    return prisma.invoice.update({ where: { id }, data: { status } });
  }

  async update(id: string, data: Partial<InvoiceData & { status: InvoiceStatus }>) {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new Error("Invoice not found");
    if (["PAID", "CANCELLED"].includes(invoice.status)) {
      throw new Error("Cannot update a paid or cancelled invoice");
    }
    return prisma.invoice.update({ where: { id }, data });
  }

  async getOverdueInvoices() {
    return prisma.invoice.findMany({
      where: { status: "SENT", dueDate: { lt: new Date() } },
      include: { order: { include: { company: true } }, payments: true },
      orderBy: { dueDate: "asc" },
    });
  }
}

export default new InvoiceService();
