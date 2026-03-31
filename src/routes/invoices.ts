import { Router } from "express";
import prisma from "../utils/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const data = await prisma.invoice.findMany({ include: { order: { include: { company: true } }, payments: true }, orderBy: { createdAt: "desc" } });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

router.post("/", async (req, res) => {
  try {
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(count + 1).padStart(5, "0")}`;
    const inv = await prisma.invoice.create({ data: { ...req.body, invoiceNumber }, include: { order: true } });
    res.status(201).json(inv);
  } catch (err) {
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const inv = await prisma.invoice.update({ where: { id: req.params.id }, data: req.body });
    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: "Failed to update invoice" });
  }
});

export default router;
