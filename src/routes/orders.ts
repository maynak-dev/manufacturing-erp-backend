import { Router } from "express";
import prisma from "../utils/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { company: true, contact: true, items: { include: { product: true } } },
        orderBy: { createdAt: "desc" }
      }),
      prisma.order.count({ where })
    ]);
    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { company: true, contact: true, items: { include: { product: true } }, workOrders: true, invoices: true, dispatches: true }
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { items, ...orderData } = req.body;
    const count = await prisma.order.count();
    const orderNumber = `ORD-${String(count + 1).padStart(5, "0")}`;
    const totalAmount = items?.reduce((sum: number, i: any) => sum + i.quantity * i.unitPrice, 0) || 0;

    const order = await prisma.order.create({
      data: {
        ...orderData, orderNumber, totalAmount,
        items: items ? { create: items.map((i: any) => ({ ...i, total: i.quantity * i.unitPrice })) } : undefined
      },
      include: { items: true, company: true }
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const order = await prisma.order.update({ where: { id: req.params.id }, data: req.body });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: req.params.id } });
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order" });
  }
});

export default router;
