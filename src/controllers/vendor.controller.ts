import { Response } from "express";
import vendorService from "../services/vendor.service";
import { AuthRequest } from "../middleware/auth";

export class VendorController {
  async list(req: AuthRequest, res: Response) {
    try {
      const result = await vendorService.list({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        search: req.query.search as string,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch vendors" });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const vendor = await vendorService.findById(req.params.id);
      res.json(vendor);
    } catch (err: any) {
      res.status(err.message === "Vendor not found" ? 404 : 500).json({ error: err.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.body.name) return res.status(400).json({ error: "name is required" });
      const vendor = await vendorService.create(req.body);
      res.status(201).json(vendor);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to create vendor" });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const vendor = await vendorService.update(req.params.id, req.body);
      res.json(vendor);
    } catch (err: any) {
      res.status(err.message === "Vendor not found" ? 404 : 500).json({ error: err.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await vendorService.delete(req.params.id);
      res.json(result);
    } catch (err: any) {
      const status = err.message === "Vendor not found" ? 404 : err.message?.includes("Cannot delete") ? 409 : 500;
      res.status(status).json({ error: err.message });
    }
  }
}

export default new VendorController();
