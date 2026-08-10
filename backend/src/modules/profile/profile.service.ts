import { prisma } from '../../shared/utils/prisma';

export interface UpdateProfileData {
  displayNamePrivate?: string;
  displayNamePublic?: string;
  bio?: string;
  avatarUrl?: string;
}

export const profileService = {
  getMyProfile: async (userId: string) => {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        preference: true,
        _count: {
          select: {
            friendshipsRequested: true,
            friendshipsReceived: true,
            lockets: true,
          }
        }
      }
    });
  },

  getPublicProfile: async (publicId: string) => {
    return prisma.user.findUnique({
      where: { publicId },
      select: {
        displayNamePublic: true,
        publicId: true,
        avatarUrl: true,
        bio: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
        _count: {
          select: {
            friendshipsRequested: true,
            friendshipsReceived: true,
            lockets: {
              where: { visibility: 'PUBLIC', status: 'ACTIVE' }
            }
          }
        }
      }
    });
  },

  updateProfile: async (userId: string, data: UpdateProfileData) => {
    return prisma.user.update({
      where: { id: userId },
      data
    });
  }
};
