import { Router } from "express";
import productController from "../../controllers/product.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { activityLogger } from "../../middleware/activityLogger";

const router = Router();
router.use(authenticate, activityLogger);

router.get("/categories", productController.getCategories.bind(productController));
router.get("/", productController.list.bind(productController));
router.get("/:id", productController.getById.bind(productController));
router.post("/", productController.create.bind(productController));
router.put("/:id", productController.update.bind(productController));
router.put("/:id/bom", productController.updateBOM.bind(productController));
router.delete("/:id", authorize("ADMIN", "PROCUREMENT"), productController.delete.bind(productController));

export default router;
