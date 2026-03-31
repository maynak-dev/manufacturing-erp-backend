import { Router } from "express";
import dashboardController from "../../controllers/dashboard.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/stats", dashboardController.getStats.bind(dashboardController));
router.get("/revenue-chart", dashboardController.getRevenueChart.bind(dashboardController));
router.get("/order-breakdown", dashboardController.getOrderStatusBreakdown.bind(dashboardController));

export default router;
