import { Router } from "express";
import invoiceController from "../../controllers/invoice.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { activityLogger } from "../../middleware/activityLogger";

const router = Router();
router.use(authenticate, activityLogger);

router.get("/overdue", invoiceController.getOverdue.bind(invoiceController));
router.get("/", invoiceController.list.bind(invoiceController));
router.get("/:id", invoiceController.getById.bind(invoiceController));
router.post("/", authorize("ADMIN", "FINANCE", "SALES"), invoiceController.create.bind(invoiceController));
router.put("/:id/status", invoiceController.updateStatus.bind(invoiceController));
router.put("/:id", authorize("ADMIN", "FINANCE"), invoiceController.update.bind(invoiceController));

export default router;
