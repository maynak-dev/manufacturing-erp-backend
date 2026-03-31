import { Router } from "express";
import inventoryController from "../../controllers/inventory.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { activityLogger } from "../../middleware/activityLogger";
import { validate, inventorySchema } from "../../middleware/validate";

const router = Router();
router.use(authenticate, activityLogger);

router.get("/summary", inventoryController.getSummary.bind(inventoryController));
router.get("/low-stock", inventoryController.getLowStockAlerts.bind(inventoryController));
router.get("/", inventoryController.list.bind(inventoryController));
router.get("/:id", inventoryController.getById.bind(inventoryController));
router.post("/", validate(inventorySchema), inventoryController.create.bind(inventoryController));
router.put("/:id/adjust", inventoryController.adjustQuantity.bind(inventoryController));
router.put("/:id", inventoryController.update.bind(inventoryController));

export default router;
