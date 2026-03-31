import prisma from "../utils/prisma";
import { InventoryType } from "@prisma/client";

interface InventoryData {
  productId: string;
  type: InventoryType;
  quantity: number;
  warehouse?: string;
  location?: string;
  reorderLevel?: number;
}

export class InventoryService {
  async list({ type, productId, lowStock }: { type?: InventoryType; productId?: string; lowStock?: boolean } = {}) {
    const where: any = {};
    if (type) where.type = type;
    if (productId) where.productId = productId;

    const data = await prisma.inventory.findMany({
      where,
      include: { product: true },
      orderBy: { updatedAt: "desc" },
    });

    if (lowStock) {
      return data.filter((i) => i.reorderLevel != null && i.quantity <= i.reorderLevel);
    }
    return data;
  }

  async findById(id: string) {
    const item = await prisma.inventory.findUnique({ where: { id }, include: { product: true } });
    if (!item) throw new Error("Inventory record not found");
    return item;
  }

  async create(data: InventoryData) {
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new Error("Product not found");
    return prisma.inventory.create({ data, include: { product: true } });
  }

  async update(id: string, data: Partial<InventoryData>) {
    const exists = await prisma.inventory.findUnique({ where: { id } });
    if (!exists) throw new Error("Inventory record not found");
    return prisma.inventory.update({ where: { id }, data, include: { product: true } });
  }

  async adjustQuantity(id: string, delta: number, reason?: string) {
    const item = await prisma.inventory.findUnique({ where: { id } });
    if (!item) throw new Error("Inventory record not found");
    const newQty = item.quantity + delta;
    if (newQty < 0) throw new Error("Adjustment would result in negative stock");
    return prisma.inventory.update({
      where: { id },
      data: { quantity: newQty },
      include: { product: true },
    });
  }

  async getLowStockAlerts() {
    const items = await prisma.inventory.findMany({
      where: { reorderLevel: { not: null } },
      include: { product: true },
    });
    return items.filter((i) => i.reorderLevel != null && i.quantity <= i.reorderLevel);
  }

  async getSummary() {
    const [rawMaterials, wip, finishedGoods] = await Promise.all([
      prisma.inventory.aggregate({ where: { type: "RAW_MATERIAL" }, _sum: { quantity: true }, _count: true }),
      prisma.inventory.aggregate({ where: { type: "WIP" }, _sum: { quantity: true }, _count: true }),
      prisma.inventory.aggregate({ where: { type: "FINISHED_GOOD" }, _sum: { quantity: true }, _count: true }),
    ]);
    return {
      rawMaterials: { count: rawMaterials._count, totalQty: rawMaterials._sum.quantity || 0 },
      wip: { count: wip._count, totalQty: wip._sum.quantity || 0 },
      finishedGoods: { count: finishedGoods._count, totalQty: finishedGoods._sum.quantity || 0 },
    };
  }
}

export default new InventoryService();
