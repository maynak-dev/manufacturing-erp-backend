import prisma from "../utils/prisma";
import { PurchaseOrderStatus } from "@prisma/client";

interface POData {
  vendorId: string;
  totalAmount?: number;
  expectedDate?: Date;
  notes?: string;
}

export class PurchaseOrderService {
  async list({ status, vendorId }: { status?: PurchaseOrderStatus; vendorId?: string } = {}) {
    const where: any = {};
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;
    return prisma.purchaseOrder.findMany({
      where,
      include: { vendor: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id }, include: { vendor: true } });
    if (!po) throw new Error("Purchase order not found");
    return po;
  }

  async create(data: POData) {
    const vendor = await prisma.vendor.findUnique({ where: { id: data.vendorId } });
    if (!vendor) throw new Error("Vendor not found");

    const count = await prisma.purchaseOrder.count();
    const poNumber = `PO-${String(count + 1).padStart(5, "0")}`;
    return prisma.purchaseOrder.create({ data: { ...data, poNumber }, include: { vendor: true } });
  }

  async updateStatus(id: string, status: PurchaseOrderStatus) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) throw new Error("Purchase order not found");

    const validTransitions: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
      DRAFT: ["APPROVED", "CANCELLED"],
      APPROVED: ["ORDERED", "CANCELLED"],
      ORDERED: ["RECEIVED", "CANCELLED"],
      RECEIVED: [],
      CANCELLED: [],
    };
    if (!validTransitions[po.status].includes(status)) {
      throw new Error(`Cannot transition from ${po.status} to ${status}`);
    }
    return prisma.purchaseOrder.update({ where: { id }, data: { status } });
  }

  async markReceived(
    id: string,
    { receivedDate, receivedQuantity }: { receivedDate?: Date; receivedQuantity?: number }
  ) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) throw new Error("Purchase order not found");
    if (po.status !== "ORDERED") throw new Error("Only ORDERED purchase orders can be marked received");
    return prisma.purchaseOrder.update({
      where: { id },
      data: { status: "RECEIVED", receivedDate: receivedDate || new Date(), receivedQuantity },
    });
  }

  async update(id: string, data: Partial<POData>) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) throw new Error("Purchase order not found");
    if (["RECEIVED", "CANCELLED"].includes(po.status)) {
      throw new Error("Cannot update a received or cancelled purchase order");
    }
    return prisma.purchaseOrder.update({ where: { id }, data, include: { vendor: true } });
  }
}

export default new PurchaseOrderService();
