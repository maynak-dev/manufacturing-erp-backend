import { Router } from "express";
import notificationController from "../../controllers/notification.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/unread-count", notificationController.getUnreadCount.bind(notificationController));
router.get("/", notificationController.list.bind(notificationController));
router.put("/read-all", notificationController.markAllRead.bind(notificationController));
router.put("/:id/read", notificationController.markRead.bind(notificationController));
router.delete("/:id", notificationController.delete.bind(notificationController));

export default router;
