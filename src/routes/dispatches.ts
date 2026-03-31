import { Router } from "express";
import prisma from "../utils/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const data = await prisma.dispatch.findMany({ include: { order: { include: { company: true } } }, orderBy: { createdAt: "desc" } });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dispatches" });
  }
});

router.post("/", async (req, res) => {
  try {
    const count = await prisma.dispatch.count();
    const dispatchNumber = `DSP-${String(count + 1).padStart(5, "0")}`;
    const dispatch = await prisma.dispatch.create({ data: { ...req.body, dispatchNumber }, include: { order: true } });
    await prisma.order.update({ where: { id: req.body.orderId }, data: { status: "DISPATCHED" } });
    res.status(201).json(dispatch);
  } catch (err) {
    res.status(500).json({ error: "Failed to create dispatch" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const dispatch = await prisma.dispatch.update({ where: { id: req.params.id }, data: req.body });
    res.json(dispatch);
  } catch (err) {
    res.status(500).json({ error: "Failed to update dispatch" });
  }
});

export default router;
