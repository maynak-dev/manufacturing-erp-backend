import { Router } from "express";
import vendorController from "../../controllers/vendor.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { activityLogger } from "../../middleware/activityLogger";

const router = Router();
router.use(authenticate, activityLogger);

router.get("/", vendorController.list.bind(vendorController));
router.get("/:id", vendorController.getById.bind(vendorController));
router.post("/", authorize("ADMIN", "PROCUREMENT"), vendorController.create.bind(vendorController));
router.put("/:id", authorize("ADMIN", "PROCUREMENT"), vendorController.update.bind(vendorController));
router.delete("/:id", authorize("ADMIN"), vendorController.delete.bind(vendorController));

export default router;
