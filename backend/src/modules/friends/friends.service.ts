import prisma from '../../shared/utils/prisma';
import { inMemoryUserStore, SEED_USERS } from '../users/userStore';
import { notificationService } from '../notifications/notifications.service';
import { inMemoryFriendships, saveFriendship, removePersistedFriendship, PersistedFriendship } from './friendStore';

interface FriendRecord {
  id: string;
  publicId?: string;
  displayNamePublic?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  role?: string;
  email?: string;
  friendshipId?: string;
  friendshipStatus?: string;
  isSender?: boolean;
}

class FriendsService {
  async sendRequest(requesterId: string, targetPublicIdOrId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let target: any;
    try {
      target = await prisma.user.findFirst({
        where: {
          OR: [
            { id: targetPublicIdOrId },
            { publicId: targetPublicIdOrId },
            { email: targetPublicIdOrId },
          ]
        }
      });
    } catch {
      target = Array.from(inMemoryUserStore.values()).find(
        u => u.id === targetPublicIdOrId || u.publicId === targetPublicIdOrId || u.email.toLowerCase() === targetPublicIdOrId.toLowerCase()
      );
    }

    if (!target) {
      target = Array.from(inMemoryUserStore.values()).find(
        u => u.id === targetPublicIdOrId || u.publicId === targetPublicIdOrId || u.email.toLowerCase() === targetPublicIdOrId.toLowerCase()
      );
    }

    if (!target) {
      throw new Error('Không tìm thấy người dùng');
    }

    if (target.id === requesterId) {
      throw new Error('Không thể kết bạn với chính mình');
    }

    // Try DB first
    let friendshipId = `fr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    try {
      const existing = await prisma.friendship.findFirst({
        where: {
          OR: [
            { requesterId, addresseeId: target.id as string },
            { requesterId: target.id as string, addresseeId: requesterId }
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
            addresseeId: target.id as string
          }
        },
        update: { status: 'PENDING' },
        create: {
          id: friendshipId,
          requesterId,
          addresseeId: target.id as string,
          status: 'PENDING'
        }
      });
      friendshipId = friendship.id;

      try {
        const requester = await prisma.user.findUnique({ where: { id: requesterId } });
        await notificationService.createNotification(
          target.id as string,
          'FRIEND_REQUEST',
          'Lời mời kết bạn mới',
          `${requester?.displayNamePublic || 'Một người dùng'} đã gửi cho bạn lời mời kết bạn.`,
          { friendshipId: friendship.id, requesterId }
        );
      } catch {
        console.warn('[Friends] Notification non-blocking notice');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Lời mời kết bạn') || msg.includes('Không thể kết bạn')) {
        throw err;
      }
      console.warn('[Friends] DB sendRequest notice:', msg);
    }

    // Persist to disk
    const persisted: PersistedFriendship = {
      id: friendshipId,
      requesterId,
      addresseeId: target.id as string,
      status: 'PENDING',
    };
    saveFriendship(persisted);

    return persisted;
  }

  async acceptRequest(userId: string, friendshipId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let friendship: any = null;
    try {
      friendship = await prisma.friendship.findUnique({
        where: { id: friendshipId }
      });

      if (friendship) {
        if (friendship.addresseeId !== userId) {
          throw new Error('Bạn không có quyền chấp nhận lời mời này');
        }
        if (friendship.status !== 'PENDING') {
          throw new Error('Lời mời không ở trạng thái chờ');
        }

        await prisma.friendship.update({
          where: { id: friendshipId },
          data: { status: 'ACCEPTED' }
        });

        try {
          await notificationService.createNotification(
            friendship.requesterId as string,
            'FRIEND_ACCEPTED',
            'Lời mời kết bạn đã được chấp nhận',
            'Lời mời kết bạn của bạn đã được chấp nhận.',
            { friendshipId }
          );
        } catch { /* notification is non-critical */ }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Bạn không có quyền') || msg.includes('không ở trạng thái chờ')) throw err;
      console.warn('[Friends] DB accept notice:', msg);
    }

    const memF = inMemoryFriendships.get(friendshipId);
    if (memF) {
      memF.status = 'ACCEPTED';
      saveFriendship(memF);
      return { id: memF.id, status: 'ACCEPTED' };
    }

    if (friendship) {
      const persisted: PersistedFriendship = {
        id: friendship.id as string,
        status: 'ACCEPTED',
      };
      saveFriendship({ ...friendship, id: friendship.id as string, status: 'ACCEPTED' });
      return persisted;
    }

    throw new Error('Không tìm thấy lời mời kết bạn');
  }

  async rejectRequest(userId: string, friendshipId: string) {
    try {
      const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
      if (!friendship || (friendship.addresseeId !== userId && friendship.requesterId !== userId)) {
        throw new Error('Không có quyền');
      }
      await prisma.friendship.delete({ where: { id: friendshipId } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Không có quyền')) throw err;
    }
    removePersistedFriendship(friendshipId);
    return { message: 'Đã từ chối lời mời' };
  }

  async removeFriend(userId: string, friendshipId: string) {
    try {
      await prisma.friendship.delete({ where: { id: friendshipId } });
    } catch { /* DB delete is best-effort */ }
    removePersistedFriendship(friendshipId);
    return { message: 'Đã hủy kết bạn' };
  }

  async getFriends(userId: string) {
    const friendsMap = new Map<string, FriendRecord>();

    // 1. Fetch from Database
    try {
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
              role: true,
              email: true,
            }
          },
          addressee: {
            select: {
              id: true,
              publicId: true,
              displayNamePublic: true,
              avatarUrl: true,
              bio: true,
              role: true,
              email: true,
            }
          }
        }
      });

      for (const f of friendships) {
        const isRequester = f.requesterId === userId;
        const targetUser = isRequester ? f.addressee : f.requester;
        friendsMap.set(targetUser.id, {
          id: targetUser.id,
          publicId: targetUser.publicId,
          displayNamePublic: targetUser.displayNamePublic || (targetUser.email ? targetUser.email.split('@')[0] : targetUser.publicId),
          avatarUrl: targetUser.avatarUrl ?? null,
          bio: targetUser.bio ?? null,
          role: targetUser.role,
        });
      }
    } catch (err: unknown) {
      console.warn('[Friends] DB getFriends notice:', err instanceof Error ? err.message : err);
    }

    if (process.env.NODE_ENV === 'test') {
      return Array.from(friendsMap.values());
    }

    // 2. Fetch from Persisted friendships
    const memAccepted = Array.from(inMemoryFriendships.values()).filter(
      f => (f.requesterId === userId || f.addresseeId === userId) && f.status === 'ACCEPTED'
    );

    for (const f of memAccepted) {
      const otherId = (f.requesterId === userId ? f.addresseeId : f.requesterId) || '';
      if (otherId && !friendsMap.has(otherId)) {
        const u = inMemoryUserStore.get(otherId) || SEED_USERS.find(s => s.id === otherId);
        friendsMap.set(otherId, {
          id: otherId,
          publicId: u?.publicId || 'u_friend',
          displayNamePublic: u?.displayNamePublic || 'Bạn thân ẩm thực',
          avatarUrl: u?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${otherId}`,
          bio: u?.bio || null,
          email: u?.email || '',
          friendshipId: f.id,
          friendshipStatus: 'ACCEPTED',
        });
      }
    }

    return Array.from(friendsMap.values());
  }

  async getPendingRequests(userId: string) {
    const incomingMap = new Map<string, FriendRecord>();
    const outgoingMap = new Map<string, FriendRecord>();

    // 1. Fetch from Database
    try {
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
              role: true,
              email: true,
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
              role: true,
              email: true,
            }
          }
        }
      });

      for (const i of incoming) {
        incomingMap.set(i.id, {
          friendshipId: i.id,
          id: i.requester.id,
          publicId: i.requester.publicId,
          displayNamePublic: i.requester.displayNamePublic || i.requester.email.split('@')[0],
          avatarUrl: i.requester.avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${i.requester.email}`,
          bio: i.requester.bio,
          email: i.requester.email,
        });
      }

      for (const o of outgoing) {
        outgoingMap.set(o.id, {
          friendshipId: o.id,
          id: o.addressee.id,
          publicId: o.addressee.publicId,
          displayNamePublic: o.addressee.displayNamePublic || o.addressee.email.split('@')[0],
          avatarUrl: o.addressee.avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${o.addressee.email}`,
          bio: o.addressee.bio,
          email: o.addressee.email,
        });
      }
    } catch (err: unknown) {
      console.warn('[Friends] DB getPending notice:', err instanceof Error ? err.message : err);
    }

    // 2. Fetch from Persisted Friendships
    const memIncoming = Array.from(inMemoryFriendships.values()).filter(
      f => f.addresseeId === userId && f.status === 'PENDING'
    );
    for (const f of memIncoming) {
      if (!incomingMap.has(f.id) && f.requesterId) {
        const u = inMemoryUserStore.get(f.requesterId) || SEED_USERS.find(s => s.id === f.requesterId);
        incomingMap.set(f.id, {
          friendshipId: f.id,
          id: f.requesterId,
          publicId: u?.publicId || 'u_requester',
          displayNamePublic: u?.displayNamePublic || 'Người dùng',
          avatarUrl: u?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${f.requesterId}`,
          bio: u?.bio || null,
          email: u?.email || '',
        });
      }
    }

    const memOutgoing = Array.from(inMemoryFriendships.values()).filter(
      f => f.requesterId === userId && f.status === 'PENDING'
    );
    for (const f of memOutgoing) {
      if (!outgoingMap.has(f.id) && f.addresseeId) {
        const u = inMemoryUserStore.get(f.addresseeId) || SEED_USERS.find(s => s.id === f.addresseeId);
        outgoingMap.set(f.id, {
          friendshipId: f.id,
          id: f.addresseeId,
          publicId: u?.publicId || 'u_addressee',
          displayNamePublic: u?.displayNamePublic || 'Người dùng',
          avatarUrl: u?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${f.addresseeId}`,
          bio: u?.bio || null,
          email: u?.email || '',
        });
      }
    }

    return {
      incoming: Array.from(incomingMap.values()),
      outgoing: Array.from(outgoingMap.values()),
    };
  }

  async searchUsers(query: string, currentUserId: string) {
    const cleanQuery = (query || '').trim().toLowerCase();
    if (!cleanQuery) return [];

    const matchedMap = new Map<string, FriendRecord>();

    // 1. Search Database
    try {
      const users = await prisma.user.findMany({
        where: {
          AND: [
            { id: { not: currentUserId } },
            {
              OR: [
                { email: { contains: cleanQuery } },
                { displayNamePublic: { contains: cleanQuery } },
                { displayNamePrivate: { contains: cleanQuery } },
                { publicId: { contains: cleanQuery } },
              ],
            },
          ],
        },
        select: {
          id: true,
          publicId: true,
          displayNamePublic: true,
          avatarUrl: true,
          bio: true,
          email: true,
        },
        take: 20,
      });

      for (const u of users) {
        matchedMap.set(u.id, u);
      }
    } catch (err: unknown) {
      console.warn('[Friends] DB search notice:', err instanceof Error ? err.message : err);
    }

    // 2. Search In-memory / Persisted users
    const memUsers = Array.from(inMemoryUserStore.values()).filter(
      u => u.id !== currentUserId &&
           (u.email.toLowerCase().includes(cleanQuery) ||
            u.displayNamePublic.toLowerCase().includes(cleanQuery) ||
            u.publicId.toLowerCase().includes(cleanQuery))
    );
    for (const u of memUsers) {
      if (!matchedMap.has(u.id)) {
        matchedMap.set(u.id, u);
      }
    }

    // 3. Compute friendship status for all matched users
    const allUsers = Array.from(matchedMap.values());
    const results: FriendRecord[] = [];

    // Query DB friendships
    let dbFriendships: Array<{ id: string; requesterId: string; addresseeId: string; status: string }> = [];
    try {
      dbFriendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: currentUserId, addresseeId: { in: allUsers.map(u => u.id) } },
            { requesterId: { in: allUsers.map(u => u.id) }, addresseeId: currentUserId },
          ],
        },
      });
    } catch { /* DB query is best-effort */ }

    for (const u of allUsers) {
      let f: { id: string; requesterId?: string; addresseeId?: string; status?: string } | undefined = dbFriendships.find(
        df => (df.requesterId === currentUserId && df.addresseeId === u.id) ||
              (df.requesterId === u.id && df.addresseeId === currentUserId)
      );

      if (!f) {
        f = Array.from(inMemoryFriendships.values()).find(
          mf => (mf.requesterId === currentUserId && mf.addresseeId === u.id) ||
                (mf.requesterId === u.id && mf.addresseeId === currentUserId)
        );
      }

      results.push({
        id: u.id,
        publicId: u.publicId,
        displayNamePublic: u.displayNamePublic || (u.email ? u.email.split('@')[0] : ''),
        avatarUrl: u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${u.email}`,
        bio: u.bio || null,
        email: u.email,
        friendshipId: f?.id || undefined,
        friendshipStatus: f?.status || 'NONE',
        isSender: f ? f.requesterId === currentUserId : false,
      });
    }

    return results;
  }
}

export const friendsService = new FriendsService();
export default friendsService;
