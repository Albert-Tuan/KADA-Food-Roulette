import prisma from '../../shared/utils/prisma';
import { NotificationType } from '@prisma/client';

export const notificationService = {
  async createNotification(userId: string, type: NotificationType | string, title: string, message: string, data?: any) {
    return prisma.notification.create({
      data: {
        userId,
        type: type as NotificationType,
        title,
        message,
        data: data ? JSON.stringify(data) : undefined,
      },
    });
  },

  async getUserNotifications(userId: string, isRead?: boolean, limit = 20, cursor?: string) {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        isRead: isRead !== undefined ? isRead : undefined,
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return notifications;
  },

  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Không tìm thấy thông báo');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  },

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  },
};
