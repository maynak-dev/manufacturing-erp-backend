import { Response } from "express";
import productService from "../services/product.service";
import { AuthRequest } from "../middleware/auth";

export class ProductController {
  async list(req: AuthRequest, res: Response) {
    try {
      const result = await productService.list({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        search: req.query.search as string,
        category: req.query.category as string,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const product = await productService.findById(req.params.id);
      res.json(product);
    } catch (err: any) {
      res.status(err.message === "Product not found" ? 404 : 500).json({ error: err.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { name, sku } = req.body;
      if (!name) return res.status(400).json({ error: "name is required" });
      if (!sku) return res.status(400).json({ error: "sku is required" });

      const product = await productService.create(req.body);
      res.status(201).json(product);
    } catch (err: any) {
      const status = err.message?.includes("already exists") ? 409 : 500;
      res.status(status).json({ error: err.message || "Failed to create product" });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const product = await productService.update(req.params.id, req.body);
      res.json(product);
    } catch (err: any) {
      const status = err.message === "Product not found" ? 404 : err.message?.includes("already exists") ? 409 : 500;
      res.status(status).json({ error: err.message });
    }
  }

  async updateBOM(req: AuthRequest, res: Response) {
    try {
      const { bomItems } = req.body;
      if (!Array.isArray(bomItems)) {
        return res.status(400).json({ error: "bomItems must be an array" });
      }
      const product = await productService.updateBOM(req.params.id, bomItems);
      res.json(product);
    } catch (err: any) {
      res.status(err.message === "Product not found" ? 404 : 500).json({ error: err.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await productService.delete(req.params.id);
      res.json(result);
    } catch (err: any) {
      const status = err.message === "Product not found" ? 404 : err.message?.includes("Cannot delete") ? 409 : 500;
      res.status(status).json({ error: err.message });
    }
  }

  async getCategories(req: AuthRequest, res: Response) {
    try {
      const categories = await productService.getCategories();
      res.json(categories);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  }
}

export default new ProductController();
