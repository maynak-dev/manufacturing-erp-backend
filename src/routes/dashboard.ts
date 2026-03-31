import { Router } from "express";
import prisma from "../utils/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/stats", async (_, res) => {
  try {
    const [
      totalOrders, newOrders, inProductionOrders, completedOrders,
      totalCompanies, totalProducts, totalInventory,
      totalRevenue, pendingInvoices
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "NEW" } }),
      prisma.order.count({ where: { status: "IN_PRODUCTION" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.company.count(),
      prisma.product.count(),
      prisma.inventory.count(),
      prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
      prisma.invoice.count({ where: { status: { in: ["SENT", "OVERDUE"] } } })
    ]);

    res.json({
      orders: { total: totalOrders, new: newOrders, inProduction: inProductionOrders, completed: completedOrders },
      companies: totalCompanies,
      products: totalProducts,
      inventory: totalInventory,
      revenue: totalRevenue._sum.amount || 0,
      pendingInvoices
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export default router;
