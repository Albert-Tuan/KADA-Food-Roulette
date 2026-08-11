import { describe, it, expect, vi, beforeEach } from 'vitest';
import { friendsService } from '../friends.service';
import { prisma } from '../../../shared/utils/prisma';
import { notificationService } from '../../notifications/notifications.service';

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      user: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
      },
      friendship: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn(),
        findMany: vi.fn(),
      }
    }
  };
});

vi.mock('../../../shared/utils/prisma', () => ({
  prisma: mockPrisma,
  default: mockPrisma,
}));

vi.mock('../../notifications/notifications.service', () => ({
  notificationService: {
    createNotification: vi.fn(),
  }
}));

describe('friendsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendRequest', () => {
    it('should throw if target user not found', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
      await expect(friendsService.sendRequest('user1', 'target_pub')).rejects.toThrow('Không tìm thấy người dùng');
    });

    it('should throw if trying to add self', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user1' } as any);
      await expect(friendsService.sendRequest('user1', 'user1')).rejects.toThrow('Không thể kết bạn với chính mình');
    });

    it('should create friendship and notification if valid', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'target_id' } as any);
      vi.mocked(prisma.friendship.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user1', displayNamePublic: 'User 1' } as any);
      vi.mocked(prisma.friendship.upsert).mockResolvedValue({ id: 'f_id', requesterId: 'user1', addresseeId: 'target_id', status: 'PENDING' } as any);

      const result = await friendsService.sendRequest('user1', 'target_pub');

      expect(prisma.friendship.upsert).toHaveBeenCalled();
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        'target_id',
        'FRIEND_REQUEST',
        'Lời mời kết bạn mới',
        'User 1 đã gửi cho bạn lời mời kết bạn.',
        { friendshipId: 'f_id', requesterId: 'user1' }
      );
      expect(result).toEqual({ id: 'f_id', requesterId: 'user1', addresseeId: 'target_id', status: 'PENDING' });
    });
  });

  describe('acceptRequest', () => {
    it('should update friendship status to ACCEPTED and send notification', async () => {
      vi.mocked(prisma.friendship.findUnique).mockResolvedValue({
        id: 'f_id',
        requesterId: 'user1',
        addresseeId: 'user2',
        status: 'PENDING'
      } as any);
      vi.mocked(prisma.friendship.update).mockResolvedValue({ id: 'f_id', status: 'ACCEPTED' } as any);

      const result = await friendsService.acceptRequest('user2', 'f_id');

      expect(prisma.friendship.update).toHaveBeenCalledWith({
        where: { id: 'f_id' },
        data: { status: 'ACCEPTED' }
      });
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        'user1',
        'FRIEND_ACCEPTED',
        'Lời mời kết bạn đã được chấp nhận',
        'Lời mời kết bạn của bạn đã được chấp nhận.',
        { friendshipId: 'f_id' }
      );
      expect(result).toEqual({ id: 'f_id', status: 'ACCEPTED' });
    });

    it('should throw if friendship not pending or user is not addressee', async () => {
      // Test user is not addressee
      vi.mocked(prisma.friendship.findUnique).mockResolvedValue({
        id: 'f_id',
        requesterId: 'user1',
        addresseeId: 'user2',
        status: 'PENDING'
      } as any);
      await expect(friendsService.acceptRequest('user1', 'f_id')).rejects.toThrow('Bạn không có quyền chấp nhận lời mời này');

      // Test friendship not pending
      vi.mocked(prisma.friendship.findUnique).mockResolvedValue({
        id: 'f_id',
        requesterId: 'user1',
        addresseeId: 'user2',
        status: 'ACCEPTED'
      } as any);
      await expect(friendsService.acceptRequest('user2', 'f_id')).rejects.toThrow('Lời mời không ở trạng thái chờ');
    });
  });

  describe('rejectRequest', () => {
    it('should delete friendship', async () => {
      vi.mocked(prisma.friendship.findUnique).mockResolvedValue({
        id: 'f_id',
        requesterId: 'user1',
        addresseeId: 'user2',
        status: 'PENDING'
      } as any);
      vi.mocked(prisma.friendship.delete).mockResolvedValue({} as any);

      const result = await friendsService.rejectRequest('user2', 'f_id');
      expect(prisma.friendship.delete).toHaveBeenCalledWith({ where: { id: 'f_id' } });
      expect(result).toEqual({ message: 'Đã từ chối lời mời' });
    });
  });

  describe('getFriends', () => {
    it('should return mapped list of accepted friends', async () => {
      const mockFriendships = [
        {
          id: 'f1',
          requesterId: 'user1',
          addresseeId: 'user2',
          updatedAt: new Date('2023-01-01'),
          requester: { id: 'user1', publicId: 'pub1', displayNamePublic: 'User 1', avatarUrl: null, bio: null, role: 'USER' },
          addressee: { id: 'user2', publicId: 'pub2', displayNamePublic: 'User 2', avatarUrl: null, bio: null, role: 'USER' },
        },
        {
          id: 'f2',
          requesterId: 'user3',
          addresseeId: 'user1',
          updatedAt: new Date('2023-01-02'),
          requester: { id: 'user3', publicId: 'pub3', displayNamePublic: 'User 3', avatarUrl: null, bio: null, role: 'USER' },
          addressee: { id: 'user1', publicId: 'pub1', displayNamePublic: 'User 1', avatarUrl: null, bio: null, role: 'USER' },
        }
      ];
      vi.mocked(prisma.friendship.findMany).mockResolvedValue(mockFriendships as any);

      const result = await friendsService.getFriends('user1');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'user2',
        publicId: 'pub2',
        displayNamePublic: 'User 2',
        avatarUrl: null,
        bio: null,
        role: 'USER'
      });
      expect(result[1]).toEqual({
        id: 'user3',
        publicId: 'pub3',
        displayNamePublic: 'User 3',
        avatarUrl: null,
        bio: null,
        role: 'USER'
      });
    });
  });
});
