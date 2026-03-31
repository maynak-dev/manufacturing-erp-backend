import { Router } from "express";
import prisma from "../utils/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const data = await prisma.workOrder.findMany({ include: { order: { include: { company: true } } }, orderBy: { createdAt: "desc" } });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch work orders" });
  }
});

router.post("/", async (req, res) => {
  try {
    const count = await prisma.workOrder.count();
    const workOrderNumber = `WO-${String(count + 1).padStart(5, "0")}`;
    const wo = await prisma.workOrder.create({ data: { ...req.body, workOrderNumber }, include: { order: true } });
    // Update order status
    await prisma.order.update({ where: { id: req.body.orderId }, data: { status: "IN_PRODUCTION" } });
    res.status(201).json(wo);
  } catch (err) {
    res.status(500).json({ error: "Failed to create work order" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const wo = await prisma.workOrder.update({ where: { id: req.params.id }, data: req.body });
    res.json(wo);
  } catch (err) {
    res.status(500).json({ error: "Failed to update work order" });
  }
});

export default router;
