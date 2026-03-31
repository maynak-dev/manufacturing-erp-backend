import { Router } from "express";
import contactController from "../../controllers/contact.controller";
import { authenticate } from "../../middleware/auth";
import { activityLogger } from "../../middleware/activityLogger";

const router = Router();
router.use(authenticate, activityLogger);

router.get("/", contactController.list.bind(contactController));
router.get("/:id", contactController.getById.bind(contactController));
router.post("/", contactController.create.bind(contactController));
router.put("/:id", contactController.update.bind(contactController));
router.delete("/:id", contactController.delete.bind(contactController));

export default router;