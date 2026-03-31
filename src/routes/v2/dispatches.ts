import { Router } from "express";
import dispatchController from "../../controllers/dispatch.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { activityLogger } from "../../middleware/activityLogger";

const router = Router();
router.use(authenticate, activityLogger);

router.get("/", dispatchController.list.bind(dispatchController));
router.get("/:id", dispatchController.getById.bind(dispatchController));
router.post("/", authorize("ADMIN", "PRODUCTION"), dispatchController.create.bind(dispatchController));
router.put("/:id/status", dispatchController.updateStatus.bind(dispatchController));
router.put("/:id", dispatchController.update.bind(dispatchController));

export default router;
