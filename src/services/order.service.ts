import prisma from "../utils/prisma";
import { OrderStatus } from "@prisma/client";

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface CreateOrderData {
  companyId: string;
  contactId?: string;
  deliveryDate?: Date;
  notes?: string;
  items: OrderItem[];
}

interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  companyId?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export class OrderService {
  async list({ page = 1, limit = 20, status, companyId, search, fromDate, toDate }: OrderFilters) {
    const where: any = {};
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { company: { name: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          company: true,
          contact: true,
          items: { include: { product: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        company: true,
        contact: true,
        items: { include: { product: true } },
        workOrders: true,
        invoices: { include: { payments: true } },
        dispatches: true,
      },
    });
    if (!order) throw new Error("Order not found");
    return order;
  }

  async create(data: CreateOrderData) {
    const { items, ...orderData } = data;

    // Validate products exist
    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    if (products.length !== productIds.length) throw new Error("One or more products not found");

    const count = await prisma.order.count();
    const orderNumber = `ORD-${String(count + 1).padStart(5, "0")}`;
    const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

    return prisma.order.create({
      data: {
        ...orderData,
        orderNumber,
        totalAmount,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.quantity * i.unitPrice,
          })),
        },
      },
      include: { items: { include: { product: true } }, company: true, contact: true },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new Error("Order not found");

    // Status transition guard
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      NEW: ["IN_PRODUCTION", "CANCELLED"],
      IN_PRODUCTION: ["COMPLETED", "CANCELLED"],
      COMPLETED: ["DISPATCHED"],
      DISPATCHED: [],
      CANCELLED: [],
    };
    if (!validTransitions[order.status].includes(status)) {
      throw new Error(`Cannot transition from ${order.status} to ${status}`);
    }

    return prisma.order.update({ where: { id }, data: { status } });
  }

  async update(id: string, data: Partial<Omit<CreateOrderData, "items">>) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new Error("Order not found");
    if (order.status === "CANCELLED") throw new Error("Cannot update a cancelled order");
    return prisma.order.update({ where: { id }, data });
  }

  async delete(id: string) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new Error("Order not found");
    if (!["NEW", "CANCELLED"].includes(order.status)) {
      throw new Error("Only NEW or CANCELLED orders can be deleted");
    }
    await prisma.order.delete({ where: { id } });
    return { message: "Order deleted" };
  }
}

export default new OrderService();
