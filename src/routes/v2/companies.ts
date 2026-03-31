import { Router } from "express";
import companyController from "../../controllers/company.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { activityLogger } from "../../middleware/activityLogger";

const router = Router();
router.use(authenticate, activityLogger);

router.get("/", companyController.list.bind(companyController));
router.get("/:id", companyController.getById.bind(companyController));
router.post("/", companyController.create.bind(companyController));
router.put("/:id", companyController.update.bind(companyController));
router.delete("/:id", authorize("ADMIN", "SALES"), companyController.delete.bind(companyController));

export default router;
