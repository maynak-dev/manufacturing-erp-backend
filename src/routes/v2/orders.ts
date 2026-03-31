import { Router } from "express";
import orderController from "../../controllers/order.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { activityLogger } from "../../middleware/activityLogger";
import { validate, orderSchema } from "../../middleware/validate";

const router = Router();
router.use(authenticate, activityLogger);

router.get("/", orderController.list.bind(orderController));
router.get("/:id", orderController.getById.bind(orderController));
router.post("/", validate(orderSchema), orderController.create.bind(orderController));
router.put("/:id/status", orderController.updateStatus.bind(orderController));
router.put("/:id", orderController.update.bind(orderController));
router.delete("/:id", authorize("ADMIN", "SALES"), orderController.delete.bind(orderController));

export default router;
