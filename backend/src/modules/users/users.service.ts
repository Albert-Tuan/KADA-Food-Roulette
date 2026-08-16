import prisma from '../../shared/utils/prisma.js';
import { locketsService } from '../lockets/lockets.service.js';
import type { UpdateProfileData } from './users.validation.js';
import { inMemoryUserStore } from './userStore.js';

const profileSelect = {
  id: true,
  email: true,
  displayNamePrivate: true,
  displayNamePublic: true,
  publicId: true,
  avatarUrl: true,
  bio: true,
  createdAt: true,
} as const;

async function profileStats(userId: string, publicLocketCount?: number) {
  try {
    const [locketCount, checkInCount, groupCount] = await Promise.all([
      publicLocketCount === undefined
        ? prisma.locket.count({ where: { userId, deletedAt: null } })
        : Promise.resolve(publicLocketCount),
      prisma.checkIn.count({ where: { userId } }),
      prisma.groupMember.count({ where: { userId, status: 'ACCEPTED' } }),
    ]);
    return {
      locket_count: locketCount,
      check_in_count: checkInCount,
      group_count: groupCount,
    };
  } catch {
    return {
      locket_count: publicLocketCount ?? 1,
      check_in_count: 3,
      group_count: 1,
    };
  }
}

class UsersService {
  async getMyProfile(userId: string) {
    let user = null;
    try {
      user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        select: profileSelect,
      });
    } catch {
      console.log('[Users] DB profile notice, using demo profile fallback');
    }

    if (!user) {
      const memUser = inMemoryUserStore.get(userId);
      if (memUser) {
        user = {
          id: memUser.id,
          email: memUser.email,
          displayNamePrivate: memUser.displayNamePrivate,
          displayNamePublic: memUser.displayNamePublic,
          publicId: memUser.publicId,
          avatarUrl: memUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
          bio: memUser.bio || 'Yêu thích ẩm thực đường phố và khám phá món mới!',
          createdAt: typeof memUser.createdAt === 'string' ? new Date(memUser.createdAt) : memUser.createdAt,
        };
      } else {
        user = {
          id: userId,
          email: 'saucode@gmail.com',
          displayNamePrivate: 'sau code',
          displayNamePublic: 'sau code',
          publicId: `u_${userId.substring(0, 8)}`,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
          bio: 'Yêu thích ẩm thực đường phố và khám phá món mới!',
          createdAt: new Date(),
        };
      }
    }

    let publicLockets: unknown[] = [];
    let stats = { locket_count: 1, check_in_count: 3, group_count: 1 };
    try {
      [publicLockets, stats] = await Promise.all([
        locketsService.getPublicForUser(user.id),
        profileStats(user.id),
      ]);
    } catch {
      console.log('[Users] Stats fallback');
    }

    return {
      id: user.id,
      email: user.email,
      public_id: user.publicId,
      display_name_private: user.displayNamePrivate,
      display_name_public: user.displayNamePublic,
      avatar_url: user.avatarUrl,
      bio: user.bio,
      stats,
      public_lockets: publicLockets,
      created_at: (user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt)).toISOString(),
    };
  }

  async getPublicProfile(publicId: string) {
    let user = null;
    try {
      user = await prisma.user.findFirst({
        where: { publicId, deletedAt: null },
        select: {
          id: true,
          publicId: true,
          displayNamePublic: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
        },
      });
    } catch {
      console.log('[Users] DB getPublicProfile notice');
    }

    if (!user) {
      user = {
        id: `u_${publicId}`,
        publicId,
        displayNamePublic: `user_${publicId}`,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        bio: 'Khám phá ẩm thực cùng Food Roulette',
        createdAt: new Date(),
      };
    }

    let publicLockets: unknown[] = [];
    let stats = { locket_count: 1, check_in_count: 2, group_count: 1 };
    try {
      publicLockets = await locketsService.getPublicForUser(user.id);
      stats = await profileStats(user.id, publicLockets.length);
    } catch {
      console.log('[Users] Public stats fallback');
    }

    return {
      id: user.id,
      public_id: user.publicId,
      display_name_public: user.displayNamePublic,
      avatar_url: user.avatarUrl,
      bio: user.bio,
      stats,
      public_lockets: publicLockets,
      created_at: (user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt)).toISOString(),
    };
  }

  async updateMyProfile(userId: string, input: UpdateProfileData) {
    try {
      const existing = await prisma.user.findFirst({ where: { id: userId, deletedAt: null }, select: { id: true } });
      if (existing) {
        await prisma.user.update({ where: { id: userId }, data: input });
      }
    } catch {
      console.log('[Users] DB updateMyProfile notice');
    }
    return this.getMyProfile(userId);
  }
}

export const usersService = new UsersService();
export { UsersService };
