import { Router } from "express";
import purchaseOrderController from "../../controllers/purchaseOrder.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { activityLogger } from "../../middleware/activityLogger";

const router = Router();
router.use(authenticate, activityLogger);

router.get("/", purchaseOrderController.list.bind(purchaseOrderController));
router.get("/:id", purchaseOrderController.getById.bind(purchaseOrderController));
router.post("/", authorize("ADMIN", "PROCUREMENT"), purchaseOrderController.create.bind(purchaseOrderController));
router.put("/:id/status", purchaseOrderController.updateStatus.bind(purchaseOrderController));
router.put("/:id/receive", purchaseOrderController.markReceived.bind(purchaseOrderController));
router.put("/:id", authorize("ADMIN", "PROCUREMENT"), purchaseOrderController.update.bind(purchaseOrderController));

export default router;
