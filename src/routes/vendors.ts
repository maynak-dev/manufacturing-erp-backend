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
      where.OR = [{ name: { contains: search, mode: "insensitive" } }];
    }
    
    const [data, total] = await Promise.all([
      prisma.vendor.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.vendor.count({ where })
    ]);
    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vendor" });
  }
});

// Get by ID
router.get("/:id", async (req, res) => {
  try {
    const item = await prisma.vendor.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Vendor not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vendor" });
  }
});

// Create
router.post("/", async (req, res) => {
  try {
    const item = await prisma.vendor.create({ data: req.body });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to create vendor" });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const item = await prisma.vendor.update({ where: { id: req.params.id }, data: req.body });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to update vendor" });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    await prisma.vendor.delete({ where: { id: req.params.id } });
    res.json({ message: "Vendor deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete vendor" });
  }
});


export default router;
