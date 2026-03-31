import prisma from "../utils/prisma";

interface VendorData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gst?: string;
}

export class VendorService {
  async list({ page = 1, limit = 20, search }: { page?: number; limit?: number; search?: string } = {}) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { gst: { contains: search, mode: "insensitive" } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { purchaseOrders: true } } },
      }),
      prisma.vendor.count({ where }),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, poNumber: true, status: true, totalAmount: true, createdAt: true },
        },
      },
    });
    if (!vendor) throw new Error("Vendor not found");
    return vendor;
  }

  async create(data: VendorData) {
    return prisma.vendor.create({ data });
  }

  async update(id: string, data: Partial<VendorData>) {
    const exists = await prisma.vendor.findUnique({ where: { id } });
    if (!exists) throw new Error("Vendor not found");
    return prisma.vendor.update({ where: { id }, data });
  }

  async delete(id: string) {
    const exists = await prisma.vendor.findUnique({ where: { id } });
    if (!exists) throw new Error("Vendor not found");
    const poCount = await prisma.purchaseOrder.count({ where: { vendorId: id } });
    if (poCount > 0) throw new Error(`Cannot delete vendor with ${poCount} associated purchase order(s)`);
    await prisma.vendor.delete({ where: { id } });
    return { message: "Vendor deleted" };
  }
}

export default new VendorService();
