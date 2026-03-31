import prisma from "../utils/prisma";
import { PaymentStatus } from "@prisma/client";

interface PaymentData {
  invoiceId: string;
  amount: number;
  method?: string;
  reference?: string;
  status?: PaymentStatus;
  paidAt?: Date;
}

export class PaymentService {
  async list({ invoiceId }: { invoiceId?: string } = {}) {
    const where: any = {};
    if (invoiceId) where.invoiceId = invoiceId;
    return prisma.payment.findMany({
      where,
      include: { invoice: { include: { order: { include: { company: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { invoice: { include: { order: true } } },
    });
    if (!payment) throw new Error("Payment not found");
    return payment;
  }

  async create(data: PaymentData) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: { payments: true },
    });
    if (!invoice) throw new Error("Invoice not found");
    if (invoice.status === "PAID") throw new Error("Invoice is already fully paid");
    if (invoice.status === "CANCELLED") throw new Error("Cannot add payment to a cancelled invoice");

    // Check over-payment
    const alreadyPaid = invoice.payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((s, p) => s + p.amount, 0);
    const remaining = invoice.amount - alreadyPaid;
    if (data.status === "COMPLETED" && data.amount > remaining + 0.01) {
      throw new Error(`Payment amount exceeds remaining balance of ${remaining.toFixed(2)}`);
    }

    const payment = await prisma.payment.create({
      data: {
        ...data,
        paidAt: data.status === "COMPLETED" ? data.paidAt || new Date() : data.paidAt,
      },
      include: { invoice: true },
    });

    // Auto-mark invoice as PAID if fully paid
    if (data.status === "COMPLETED") {
      const newTotal = alreadyPaid + data.amount;
      if (newTotal >= invoice.amount) {
        await prisma.invoice.update({ where: { id: data.invoiceId }, data: { status: "PAID" } });
      }
    }

    return payment;
  }

  async updateStatus(id: string, status: PaymentStatus) {
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new Error("Payment not found");
    return prisma.payment.update({ where: { id }, data: { status } });
  }
}

export default new PaymentService();
