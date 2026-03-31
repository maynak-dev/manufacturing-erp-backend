import prisma from "../utils/prisma";

export class NotificationService {
  async list(userId: string, { unreadOnly = false } = {}) {
    return prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async markRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new Error("Notification not found");
    if (notification.userId !== userId) throw new Error("Forbidden");
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    return { message: "All notifications marked as read" };
  }

  async create(userId: string, title: string, message: string) {
    return prisma.notification.create({ data: { userId, title, message } });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  async delete(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new Error("Notification not found");
    if (notification.userId !== userId) throw new Error("Forbidden");
    await prisma.notification.delete({ where: { id } });
    return { message: "Notification deleted" };
  }
}

export default new NotificationService();
