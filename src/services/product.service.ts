import prisma from "../utils/prisma";

interface ProductData {
  name: string;
  sku: string;
  category?: string;
  unit?: string;
  price?: number;
  description?: string;
}

interface BOMItem {
  materialName: string;
  quantity: number;
  unit?: string;
}

export class ProductService {
  async list({ page = 1, limit = 20, search, category }: { page?: number; limit?: number; search?: string; category?: string }) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) where.category = { equals: category, mode: "insensitive" };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { bomItems: true },
      }),
      prisma.product.count({ where }),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { bomItems: true, inventory: true },
    });
    if (!product) throw new Error("Product not found");
    return product;
  }

  async create(data: ProductData & { bomItems?: BOMItem[] }) {
    const { bomItems, ...productData } = data;
    const existing = await prisma.product.findUnique({ where: { sku: productData.sku } });
    if (existing) throw new Error(`SKU '${productData.sku}' already exists`);

    return prisma.product.create({
      data: {
        ...productData,
        bomItems: bomItems ? { create: bomItems } : undefined,
      },
      include: { bomItems: true },
    });
  }

  async update(id: string, data: Partial<ProductData>) {
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) throw new Error("Product not found");
    if (data.sku && data.sku !== exists.sku) {
      const skuConflict = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (skuConflict) throw new Error(`SKU '${data.sku}' already exists`);
    }
    return prisma.product.update({ where: { id }, data, include: { bomItems: true } });
  }

  async updateBOM(productId: string, bomItems: BOMItem[]) {
    const exists = await prisma.product.findUnique({ where: { id: productId } });
    if (!exists) throw new Error("Product not found");
    // Replace all BOM items
    await prisma.bOMItem.deleteMany({ where: { productId } });
    return prisma.product.update({
      where: { id: productId },
      data: { bomItems: { create: bomItems } },
      include: { bomItems: true },
    });
  }

  async delete(id: string) {
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) throw new Error("Product not found");
    const usedInOrders = await prisma.orderItem.count({ where: { productId: id } });
    if (usedInOrders > 0) throw new Error("Cannot delete a product that is part of existing orders");
    await prisma.product.delete({ where: { id } });
    return { message: "Product deleted" };
  }

  async getCategories() {
    const products = await prisma.product.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    });
    return products.map((p) => p.category).filter(Boolean);
  }
}

export default new ProductService();
