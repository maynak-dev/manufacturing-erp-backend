import { Router } from "express";
import prisma from "../utils/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// List all
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    
    const where: any = {};
    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }, { sku: { contains: search, mode: "insensitive" } }];
    }
    
    const [data, total] = await Promise.all([
      prisma.product.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.product.count({ where })
    ]);
    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Get by ID
router.get("/:id", async (req, res) => {
  try {
    const item = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Product not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Create
router.post("/", async (req, res) => {
  try {
    const item = await prisma.product.create({ data: req.body });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const item = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});


export default router;
