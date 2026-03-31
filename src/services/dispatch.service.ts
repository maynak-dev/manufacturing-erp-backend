import prisma from "../utils/prisma";
import { DispatchStatus } from "@prisma/client";

interface DispatchData {
  orderId: string;
  transportDetails?: string;
  trackingNumber?: string;
  dispatchDate?: Date;
  deliveryDate?: Date;
}

export class DispatchService {
  async list({ orderId }: { orderId?: string } = {}) {
    const where: any = {};
    if (orderId) where.orderId = orderId;
    return prisma.dispatch.findMany({
      where,
      include: { order: { include: { company: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const dispatch = await prisma.dispatch.findUnique({
      where: { id },
      include: { order: { include: { company: true, contact: true } } },
    });
    if (!dispatch) throw new Error("Dispatch not found");
    return dispatch;
  }

  async create(data: DispatchData) {
    const order = await prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) throw new Error("Order not found");
    if (order.status !== "COMPLETED") {
      throw new Error("Order must be COMPLETED before dispatching");
    }

    const count = await prisma.dispatch.count();
    const dispatchNumber = `DSP-${String(count + 1).padStart(5, "0")}`;

    const [dispatch] = await prisma.$transaction([
      prisma.dispatch.create({
        data: { ...data, dispatchNumber },
        include: { order: { include: { company: true } } },
      }),
      prisma.order.update({ where: { id: data.orderId }, data: { status: "DISPATCHED" } }),
    ]);
    return dispatch;
  }

  async updateStatus(id: string, status: DispatchStatus) {
    const dispatch = await prisma.dispatch.findUnique({ where: { id } });
    if (!dispatch) throw new Error("Dispatch not found");

    const validTransitions: Record<DispatchStatus, DispatchStatus[]> = {
      PREPARING: ["SHIPPED"],
      SHIPPED: ["IN_TRANSIT"],
      IN_TRANSIT: ["DELIVERED"],
      DELIVERED: [],
    };
    if (!validTransitions[dispatch.status].includes(status)) {
      throw new Error(`Cannot transition from ${dispatch.status} to ${status}`);
    }
    return prisma.dispatch.update({ where: { id }, data: { status } });
  }

  async update(id: string, data: Partial<DispatchData & { status: DispatchStatus }>) {
    const exists = await prisma.dispatch.findUnique({ where: { id } });
    if (!exists) throw new Error("Dispatch not found");
    return prisma.dispatch.update({
      where: { id },
      data,
      include: { order: { include: { company: true } } },
    });
  }
}

export default new DispatchService();
