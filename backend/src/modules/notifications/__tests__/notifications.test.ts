import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationService } from '../notifications.service';
import prisma from '../../../shared/utils/prisma';

const { mockNotificationPrisma } = vi.hoisted(() => {
  return {
    mockNotificationPrisma: {
      notification: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        count: vi.fn(),
      }
    }
  };
});

vi.mock('../../../shared/utils/prisma', () => ({
  default: mockNotificationPrisma,
  prisma: mockNotificationPrisma,
}));

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create notification record', async () => {
      const mockNotif = { id: 'n1', userId: 'user1', type: 'TEST', title: 'Test Title', message: 'Test message', data: JSON.stringify({ foo: 'bar' }) };
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotif as any);

      const result = await notificationService.createNotification('user1', 'TEST', 'Test Title', 'Test message', { foo: 'bar' });
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          type: 'TEST',
          title: 'Test Title',
          message: 'Test message',
          data: JSON.stringify({ foo: 'bar' }),
        }
      });
      expect(result).toEqual(mockNotif);
    });
  });

  describe('getUserNotifications', () => {
    it('should query user notifications', async () => {
      const mockNotifs = [{ id: 'n1' }, { id: 'n2' }];
      vi.mocked(prisma.notification.findMany).mockResolvedValue(mockNotifs as any);

      const result = await notificationService.getUserNotifications('user1', false, 10, 'cursor_id');
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1', isRead: false },
        take: 10,
        skip: 1,
        cursor: { id: 'cursor_id' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockNotifs);
    });
  });

  describe('markAsRead', () => {
    it('should update isRead to true', async () => {
      vi.mocked(prisma.notification.findFirst).mockResolvedValue({ id: 'n1', userId: 'user1' } as any);
      vi.mocked(prisma.notification.update).mockResolvedValue({ id: 'n1', isRead: true } as any);

      const result = await notificationService.markAsRead('user1', 'n1');
      expect(prisma.notification.findFirst).toHaveBeenCalledWith({ where: { id: 'n1', userId: 'user1' } });
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'n1' },
        data: { isRead: true }
      });
      expect(result).toEqual({ id: 'n1', isRead: true });
    });
  });

  describe('markAllAsRead', () => {
    it('should updateMany isRead to true', async () => {
      vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 5 } as any);

      const result = await notificationService.markAllAsRead('user1');
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user1', isRead: false },
        data: { isRead: true }
      });
      expect(result).toEqual({ count: 5 });
    });
  });

  describe('getUnreadCount', () => {
    it('should count unread notifications', async () => {
      vi.mocked(prisma.notification.count).mockResolvedValue(3);

      const result = await notificationService.getUnreadCount('user1');
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user1', isRead: false }
      });
      expect(result).toEqual(3);
    });
  });
});
