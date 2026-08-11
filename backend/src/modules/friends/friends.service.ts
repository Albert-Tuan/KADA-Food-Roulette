import prisma from '../../shared/utils/prisma';
import { notificationService } from '../notifications/notifications.service';

class FriendsService {
  async sendRequest(requesterId: string, targetPublicIdOrId: string) {
    const target = await prisma.user.findFirst({
      where: {
        OR: [
          { id: targetPublicIdOrId },
          { publicId: targetPublicIdOrId }
        ]
      }
    });

    if (!target) {
      throw new Error('Không tìm thấy người dùng');
    }

    if (target.id === requesterId) {
      throw new Error('Không thể kết bạn với chính mình');
    }

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId: target.id },
          { requesterId: target.id, addresseeId: requesterId }
        ],
        status: {
          in: ['PENDING', 'ACCEPTED']
        }
      }
    });

    if (existing) {
      throw new Error('Lời mời kết bạn đã tồn tại hoặc đã là bạn bè');
    }

    const friendship = await prisma.friendship.upsert({
      where: {
        requesterId_addresseeId: {
          requesterId,
          addresseeId: target.id
        }
      },
      update: {
        status: 'PENDING'
      },
      create: {
        requesterId,
        addresseeId: target.id,
        status: 'PENDING'
      }
    });

    const requester = await prisma.user.findUnique({
      where: { id: requesterId }
    });

    await notificationService.createNotification(
      target.id,
      'FRIEND_REQUEST',
      'Lời mời kết bạn mới',
      `${requester?.displayNamePublic || 'Một người dùng'} đã gửi cho bạn lời mời kết bạn.`,
      { friendshipId: friendship.id, requesterId }
    );

    return friendship;
  }

  async acceptRequest(userId: string, friendshipId: string) {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId }
    });

    if (!friendship) {
      throw new Error('Không tìm thấy lời mời kết bạn');
    }

    if (friendship.addresseeId !== userId) {
      throw new Error('Bạn không có quyền chấp nhận lời mời này');
    }

    if (friendship.status !== 'PENDING') {
      throw new Error('Lời mời không ở trạng thái chờ');
    }

    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' }
    });

    await notificationService.createNotification(
      friendship.requesterId,
      'FRIEND_ACCEPTED',
      'Lời mời kết bạn đã được chấp nhận',
      'Lời mời kết bạn của bạn đã được chấp nhận.',
      { friendshipId }
    );

    return updated;
  }

  async rejectRequest(userId: string, friendshipId: string) {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId }
    });

    if (!friendship || (friendship.addresseeId !== userId && friendship.requesterId !== userId)) {
      throw new Error('Không có quyền');
    }

    await prisma.friendship.delete({
      where: { id: friendshipId }
    });

    return { message: 'Đã từ chối lời mời' };
  }

  async removeFriend(userId: string, friendshipId: string) {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId }
    });

    if (!friendship || (friendship.addresseeId !== userId && friendship.requesterId !== userId)) {
      throw new Error('Không có quyền');
    }

    await prisma.friendship.delete({
      where: { id: friendshipId }
    });

    return { message: 'Đã hủy kết bạn' };
  }

  async getFriends(userId: string) {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { addresseeId: userId }
        ],
        status: 'ACCEPTED'
      },
      include: {
        requester: {
          select: {
            id: true,
            publicId: true,
            displayNamePublic: true,
            avatarUrl: true,
            bio: true,
            role: true
          }
        },
        addressee: {
          select: {
            id: true,
            publicId: true,
            displayNamePublic: true,
            avatarUrl: true,
            bio: true,
            role: true
          }
        }
      }
    });

    return friendships.map(f => {
      const isRequester = f.requesterId === userId;
      return isRequester ? f.addressee : f.requester;
    });
  }

  async getPendingRequests(userId: string) {
    const incoming = await prisma.friendship.findMany({
      where: {
        addresseeId: userId,
        status: 'PENDING'
      },
      include: {
        requester: {
          select: {
            id: true,
            publicId: true,
            displayNamePublic: true,
            avatarUrl: true,
            bio: true,
            role: true
          }
        }
      }
    });

    const outgoing = await prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: 'PENDING'
      },
      include: {
        addressee: {
          select: {
            id: true,
            publicId: true,
            displayNamePublic: true,
            avatarUrl: true,
            bio: true,
            role: true
          }
        }
      }
    });

    return { incoming, outgoing };
  }
}

export const friendsService = new FriendsService();
