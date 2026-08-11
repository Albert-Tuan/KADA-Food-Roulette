import { Response } from 'express';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import { notificationService } from './notifications.service';
import { responseHelper } from '../../shared/utils/responseHelper';

export const notificationController = {
  async getNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { isRead, limit, cursor } = req.query;

      const parsedLimit = limit ? parseInt(limit as string, 10) : 20;
      let parsedIsRead: boolean | undefined;

      if (isRead !== undefined) {
        parsedIsRead = isRead === 'true';
      }

      const notifications = await notificationService.getUserNotifications(
        userId,
        parsedIsRead,
        parsedLimit,
        cursor as string
      );

      return responseHelper.success(res, notifications);
    } catch (error: any) {
      return responseHelper.error(res, error.message || 'Lỗi hệ thống', 500);
    }
  },

  async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const unreadCount = await notificationService.getUnreadCount(userId);
      return responseHelper.success(res, { unreadCount });
    } catch (error: any) {
      return responseHelper.error(res, error.message || 'Lỗi hệ thống', 500);
    }
  },

  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      await notificationService.markAsRead(userId, id);
      return responseHelper.successWithMessage(res, 'Đã đánh dấu là đã đọc');
    } catch (error: any) {
      return responseHelper.error(res, error.message || 'Lỗi hệ thống', 400);
    }
  },

  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      await notificationService.markAllAsRead(userId);
      return responseHelper.successWithMessage(res, 'Đã đánh dấu tất cả là đã đọc');
    } catch (error: any) {
      return responseHelper.error(res, error.message || 'Lỗi hệ thống', 500);
    }
  }
};
