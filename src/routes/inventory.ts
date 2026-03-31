import { Router } from "express";
import prisma from "../utils/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const type = req.query.type as string;
    const where: any = {};
    if (type) where.type = type;
    const data = await prisma.inventory.findMany({ where, include: { product: true }, orderBy: { updatedAt: "desc" } });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

router.post("/", async (req, res) => {
  try {
    const item = await prisma.inventory.create({ data: req.body, include: { product: true } });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to create inventory" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const item = await prisma.inventory.update({ where: { id: req.params.id }, data: req.body, include: { product: true } });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to update inventory" });
  }
});

export default router;
