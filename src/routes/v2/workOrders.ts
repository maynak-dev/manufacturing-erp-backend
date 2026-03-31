import { Router } from "express";
import workOrderController from "../../controllers/workOrder.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { activityLogger } from "../../middleware/activityLogger";

const router = Router();
router.use(authenticate, activityLogger);

router.get("/", workOrderController.list.bind(workOrderController));
router.get("/:id", workOrderController.getById.bind(workOrderController));
router.post("/", authorize("ADMIN", "PRODUCTION"), workOrderController.create.bind(workOrderController));
router.put("/:id/status", workOrderController.updateStatus.bind(workOrderController));
router.put("/:id", workOrderController.update.bind(workOrderController));

export default router;
