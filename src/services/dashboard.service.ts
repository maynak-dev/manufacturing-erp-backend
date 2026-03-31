import prisma from "../utils/prisma";

export class DashboardService {
  async getStats() {
    const [
      totalOrders, newOrders, inProductionOrders, completedOrders,
      totalCompanies, totalProducts, totalInventory,
      totalRevenue, pendingInvoices,
      lowStockItems, recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "NEW" } }),
      prisma.order.count({ where: { status: "IN_PRODUCTION" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.company.count(),
      prisma.product.count(),
      prisma.inventory.count(),
      prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
      prisma.invoice.count({ where: { status: { in: ["SENT", "OVERDUE"] } } }),
      prisma.inventory.findMany({ where: { reorderLevel: { not: null } } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { company: true },
        select: { id: true, orderNumber: true, status: true, totalAmount: true, createdAt: true, company: { select: { name: true } } },
      }),
    ]);

    const lowStock = lowStockItems.filter((i) => i.reorderLevel != null && i.quantity <= i.reorderLevel).length;

    return {
      orders: { total: totalOrders, new: newOrders, inProduction: inProductionOrders, completed: completedOrders },
      companies: totalCompanies,
      products: totalProducts,
      inventory: totalInventory,
      revenue: totalRevenue._sum.amount || 0,
      pendingInvoices,
      lowStockAlerts: lowStock,
      recentOrders,
    };
  }

  async getRevenueChart(months = 6) {
    const from = new Date();
    from.setMonth(from.getMonth() - months);

    const payments = await prisma.payment.findMany({
      where: { status: "COMPLETED", paidAt: { gte: from } },
      select: { amount: true, paidAt: true },
      orderBy: { paidAt: "asc" },
    });

    // Group by month
    const grouped: Record<string, number> = {};
    payments.forEach((p) => {
      if (!p.paidAt) return;
      const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2, "0")}`;
      grouped[key] = (grouped[key] || 0) + p.amount;
    });
    return Object.entries(grouped).map(([month, revenue]) => ({ month, revenue }));
  }

  async getOrderStatusBreakdown() {
    const statuses = ["NEW", "IN_PRODUCTION", "COMPLETED", "DISPATCHED", "CANCELLED"] as const;
    const counts = await Promise.all(statuses.map((s) => prisma.order.count({ where: { status: s } })));
    return statuses.map((status, i) => ({ status, count: counts[i] }));
  }
}

export default new DashboardService();
