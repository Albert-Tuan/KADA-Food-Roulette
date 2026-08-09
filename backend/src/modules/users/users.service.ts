import prisma from '../../shared/utils/prisma.js';
import { locketsService } from '../lockets/lockets.service.js';
import { UserApiError } from './users.errors.js';
import type { UpdateProfileData } from './users.validation.js';

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
}

class UsersService {
  async getMyProfile(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: profileSelect,
    });
    if (!user) throw new UserApiError('PROFILE_NOT_FOUND', 'Không tìm thấy profile.', 404);

    const [publicLockets, stats] = await Promise.all([
      locketsService.getPublicForUser(user.id),
      profileStats(user.id),
    ]);
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
      created_at: user.createdAt.toISOString(),
    };
  }

  async getPublicProfile(publicId: string) {
    const user = await prisma.user.findFirst({
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
    if (!user) throw new UserApiError('PROFILE_NOT_FOUND', 'Không tìm thấy profile.', 404);

    const publicLockets = await locketsService.getPublicForUser(user.id);
    const stats = await profileStats(user.id, publicLockets.length);
    return {
      id: user.id,
      public_id: user.publicId,
      display_name_public: user.displayNamePublic,
      avatar_url: user.avatarUrl,
      bio: user.bio,
      stats,
      public_lockets: publicLockets,
      created_at: user.createdAt.toISOString(),
    };
  }

  async updateMyProfile(userId: string, input: UpdateProfileData) {
    const existing = await prisma.user.findFirst({ where: { id: userId, deletedAt: null }, select: { id: true } });
    if (!existing) throw new UserApiError('PROFILE_NOT_FOUND', 'Không tìm thấy profile.', 404);

    await prisma.user.update({ where: { id: userId }, data: input });
    return this.getMyProfile(userId);
  }
}

export const usersService = new UsersService();
export { UsersService };
