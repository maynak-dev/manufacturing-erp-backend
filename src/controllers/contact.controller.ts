import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import prisma from "../utils/prisma";

export class ContactController {
  async list(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const companyId = req.query.companyId as string;

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ];
      }
      if (companyId) where.companyId = companyId;

      const [data, total] = await Promise.all([
        prisma.contact.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: { company: { select: { id: true, name: true } } },
        }),
        prisma.contact.count({ where }),
      ]);

      res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const contact = await prisma.contact.findUnique({
        where: { id: req.params.id },
        include: { company: true },
      });
      if (!contact) return res.status(404).json({ error: "Contact not found" });
      res.json(contact);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch contact" });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { name, companyId } = req.body;
      if (!name) return res.status(400).json({ error: "name is required" });
      if (!companyId) return res.status(400).json({ error: "companyId is required" });

      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (!company) return res.status(404).json({ error: "Company not found" });

      const contact = await prisma.contact.create({
        data: req.body,
        include: { company: { select: { id: true, name: true } } },
      });
      res.status(201).json(contact);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to create contact" });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const exists = await prisma.contact.findUnique({ where: { id: req.params.id } });
      if (!exists) return res.status(404).json({ error: "Contact not found" });

      const contact = await prisma.contact.update({
        where: { id: req.params.id },
        data: req.body,
        include: { company: { select: { id: true, name: true } } },
      });
      res.json(contact);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to update contact" });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const exists = await prisma.contact.findUnique({ where: { id: req.params.id } });
      if (!exists) return res.status(404).json({ error: "Contact not found" });

      await prisma.contact.delete({ where: { id: req.params.id } });
      res.json({ message: "Contact deleted" });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  }
}

export default new ContactController();
