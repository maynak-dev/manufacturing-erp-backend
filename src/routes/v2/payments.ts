import { Router } from "express";
import paymentController from "../../controllers/payment.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { activityLogger } from "../../middleware/activityLogger";
import { validate, paymentSchema } from "../../middleware/validate";

const router = Router();
router.use(authenticate, activityLogger);

router.get("/", paymentController.list.bind(paymentController));
router.get("/:id", paymentController.getById.bind(paymentController));
router.post("/", authorize("ADMIN", "FINANCE"), validate(paymentSchema), paymentController.create.bind(paymentController));
router.put("/:id/status", authorize("ADMIN", "FINANCE"), paymentController.updateStatus.bind(paymentController));

export default router;
