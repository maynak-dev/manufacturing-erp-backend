import { Response } from "express";
import dashboardService from "../services/dashboard.service";
import { AuthRequest } from "../middleware/auth";

export class DashboardController {
  async getStats(req: AuthRequest, res: Response) {
    try {
      const stats = await dashboardService.getStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  }

  async getRevenueChart(req: AuthRequest, res: Response) {
    try {
      const months = Number(req.query.months) || 6;
      const data = await dashboardService.getRevenueChart(months);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch revenue chart" });
    }
  }

  async getOrderStatusBreakdown(req: AuthRequest, res: Response) {
    try {
      const data = await dashboardService.getOrderStatusBreakdown();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch order breakdown" });
    }
  }
}

export default new DashboardController();
