import prisma from "../utils/prisma";

interface CompanyFilters {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  country?: string;
}

interface CompanyData {
  name: string;
  industry?: string;
  gst?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export class CompanyService {
  async list({ page = 1, limit = 20, search, state, country }: CompanyFilters) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { gst: { contains: search, mode: "insensitive" } },
      ];
    }
    if (state) where.state = { equals: state, mode: "insensitive" };
    if (country) where.country = { equals: country, mode: "insensitive" };

    const [data, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { contacts: true, orders: true } } },
      }),
      prisma.company.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        contacts: true,
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, orderNumber: true, status: true, totalAmount: true, createdAt: true },
        },
      },
    });
    if (!company) throw new Error("Company not found");
    return company;
  }

  async create(data: CompanyData) {
    return prisma.company.create({ data });
  }

  async update(id: string, data: Partial<CompanyData>) {
    const exists = await prisma.company.findUnique({ where: { id } });
    if (!exists) throw new Error("Company not found");
    return prisma.company.update({ where: { id }, data });
  }

  async delete(id: string) {
    const exists = await prisma.company.findUnique({ where: { id } });
    if (!exists) throw new Error("Company not found");
    // Check for dependent orders
    const orderCount = await prisma.order.count({ where: { companyId: id } });
    if (orderCount > 0) {
      throw new Error(`Cannot delete company with ${orderCount} associated order(s)`);
    }
    await prisma.company.delete({ where: { id } });
    return { message: "Company deleted" };
  }
}

export default new CompanyService();
