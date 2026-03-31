import prisma from "../utils/prisma";
import { WorkOrderStatus } from "@prisma/client";

interface CreateWorkOrderData {
  orderId: string;
  productionUnit?: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}

export class WorkOrderService {
  async list({ status, orderId }: { status?: WorkOrderStatus; orderId?: string } = {}) {
    const where: any = {};
    if (status) where.status = status;
    if (orderId) where.orderId = orderId;

    return prisma.workOrder.findMany({
      where,
      include: { order: { include: { company: true, items: { include: { product: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const wo = await prisma.workOrder.findUnique({
      where: { id },
      include: { order: { include: { company: true, items: { include: { product: true } } } } },
    });
    if (!wo) throw new Error("Work order not found");
    return wo;
  }

  async create(data: CreateWorkOrderData) {
    const order = await prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) throw new Error("Order not found");
    if (order.status === "CANCELLED") throw new Error("Cannot create work order for a cancelled order");

    const count = await prisma.workOrder.count();
    const workOrderNumber = `WO-${String(count + 1).padStart(5, "0")}`;

    const [wo] = await prisma.$transaction([
      prisma.workOrder.create({
        data: { ...data, workOrderNumber },
        include: { order: { include: { company: true } } },
      }),
      prisma.order.update({ where: { id: data.orderId }, data: { status: "IN_PRODUCTION" } }),
    ]);
    return wo;
  }

  async updateStatus(id: string, status: WorkOrderStatus) {
    const wo = await prisma.workOrder.findUnique({ where: { id } });
    if (!wo) throw new Error("Work order not found");

    const validTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
      PENDING: ["IN_PROGRESS", "ON_HOLD"],
      IN_PROGRESS: ["COMPLETED", "ON_HOLD"],
      ON_HOLD: ["IN_PROGRESS", "PENDING"],
      COMPLETED: [],
    };
    if (!validTransitions[wo.status].includes(status)) {
      throw new Error(`Cannot transition from ${wo.status} to ${status}`);
    }

    const updated = await prisma.workOrder.update({ where: { id }, data: { status } });

    // If completed, check if all work orders for that order are done
    if (status === "COMPLETED") {
      const allWOs = await prisma.workOrder.findMany({ where: { orderId: wo.orderId } });
      const allDone = allWOs.every((w) => w.status === "COMPLETED" || w.id === id);
      if (allDone) {
        await prisma.order.update({ where: { id: wo.orderId }, data: { status: "COMPLETED" } });
      }
    }
    return updated;
  }

  async update(id: string, data: Partial<CreateWorkOrderData & { status: WorkOrderStatus }>) {
    const exists = await prisma.workOrder.findUnique({ where: { id } });
    if (!exists) throw new Error("Work order not found");
    return prisma.workOrder.update({
      where: { id },
      data,
      include: { order: { include: { company: true } } },
    });
  }
}

export default new WorkOrderService();
