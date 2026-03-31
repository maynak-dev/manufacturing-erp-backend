import { Router } from "express";
import prisma from "../utils/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const data = await prisma.purchaseOrder.findMany({ include: { vendor: true }, orderBy: { createdAt: "desc" } });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch purchase orders" });
  }
});

router.post("/", async (req, res) => {
  try {
    const count = await prisma.purchaseOrder.count();
    const poNumber = `PO-${String(count + 1).padStart(5, "0")}`;
    const po = await prisma.purchaseOrder.create({ data: { ...req.body, poNumber }, include: { vendor: true } });
    res.status(201).json(po);
  } catch (err) {
    res.status(500).json({ error: "Failed to create purchase order" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const po = await prisma.purchaseOrder.update({ where: { id: req.params.id }, data: req.body });
    res.json(po);
  } catch (err) {
    res.status(500).json({ error: "Failed to update purchase order" });
  }
});

export default router;
