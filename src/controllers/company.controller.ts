import { Response } from "express";
import companyService from "../services/company.service";
import { AuthRequest } from "../middleware/auth";

export class CompanyController {
  async list(req: AuthRequest, res: Response) {
    try {
      const { page, limit, search, state, country } = req.query;
      const result = await companyService.list({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        search: search as string,
        state: state as string,
        country: country as string,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const company = await companyService.findById(req.params.id);
      res.json(company);
    } catch (err: any) {
      res.status(err.message === "Company not found" ? 404 : 500).json({ error: err.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.body.name) return res.status(400).json({ error: "name is required" });
      const company = await companyService.create(req.body);
      res.status(201).json(company);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to create company" });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const company = await companyService.update(req.params.id, req.body);
      res.json(company);
    } catch (err: any) {
      res.status(err.message === "Company not found" ? 404 : 500).json({ error: err.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await companyService.delete(req.params.id);
      res.json(result);
    } catch (err: any) {
      const status = err.message === "Company not found" ? 404 : err.message.includes("Cannot delete") ? 409 : 500;
      res.status(status).json({ error: err.message });
    }
  }
}

export default new CompanyController();
