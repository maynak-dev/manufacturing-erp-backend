import { Response } from "express";
import notificationService from "../services/notification.service";
import { AuthRequest } from "../middleware/auth";

export class NotificationController {
  async list(req: AuthRequest, res: Response) {
    try {
      const data = await notificationService.list(req.user!.id, {
        unreadOnly: req.query.unreadOnly === "true",
      });
      res.json({ data });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const count = await notificationService.getUnreadCount(req.user!.id);
      res.json({ count });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  }

  async markRead(req: AuthRequest, res: Response) {
    try {
      await notificationService.markRead(req.params.id, req.user!.id);
      res.json({ message: "Marked as read" });
    } catch (err: any) {
      const status = err.message === "Notification not found" ? 404 : err.message === "Forbidden" ? 403 : 500;
      res.status(status).json({ error: err.message });
    }
  }

  async markAllRead(req: AuthRequest, res: Response) {
    try {
      const result = await notificationService.markAllRead(req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to mark all as read" });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await notificationService.delete(req.params.id, req.user!.id);
      res.json(result);
    } catch (err: any) {
      const status = err.message === "Notification not found" ? 404 : err.message === "Forbidden" ? 403 : 500;
      res.status(status).json({ error: err.message });
    }
  }
}

export default new NotificationController();
