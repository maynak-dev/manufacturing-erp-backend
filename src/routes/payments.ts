import { Router } from "express";
import prisma from "../utils/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const data = await prisma.payment.findMany({ include: { invoice: { include: { order: { include: { company: true } } } } }, orderBy: { createdAt: "desc" } });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

router.post("/", async (req, res) => {
  try {
    const payment = await prisma.payment.create({ data: req.body, include: { invoice: true } });
    // Check if invoice is fully paid
    const payments = await prisma.payment.findMany({ where: { invoiceId: req.body.invoiceId, status: "COMPLETED" } });
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0) + (req.body.status === "COMPLETED" ? req.body.amount : 0);
    const invoice = await prisma.invoice.findUnique({ where: { id: req.body.invoiceId } });
    if (invoice && totalPaid >= invoice.amount) {
      await prisma.invoice.update({ where: { id: req.body.invoiceId }, data: { status: "PAID" } });
    }
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: "Failed to create payment" });
  }
});

export default router;
