import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileService } from '../profile.service';
import { prisma } from '../../../shared/utils/prisma';
import { UserApiError } from '../../users/users.errors';

vi.mock('../../../shared/utils/prisma', () => {
  const mockPrisma = {
    user: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    userPreference: { findUnique: vi.fn(), create: vi.fn(), upsert: vi.fn() },
  };
  return {
    prisma: mockPrisma,
    default: mockPrisma
  };
});

describe('Profile Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMyProfile', () => {
    it('should return full profile with displayNamePrivate', async () => {
      const mockUser = {
        id: 'user-1',
        displayNamePrivate: 'Private Name',
        email: 'test@example.com'
      };
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as never);

      const result = await profileService.getMyProfile('user-1');

      expect(prisma.user.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'user-1', deletedAt: null }
      }));
      expect(result).toEqual(mockUser);
      expect(result?.displayNamePrivate).toBeDefined();
    });
  });

  describe('getPublicProfile', () => {
    it('should NOT include displayNamePrivate or email', async () => {
      const mockPublicUser = {
        publicId: 'public-1',
        displayNamePublic: 'Public Name',
        bio: 'Bio'
      };
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockPublicUser as never);

      const result = await profileService.getPublicProfile('public-1');

      expect(prisma.user.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: { publicId: 'public-1', deletedAt: null }
      }));
      expect(result).toEqual(mockPublicUser);
      expect(Reflect.get(result, 'displayNamePrivate')).toBeUndefined();
      expect(Reflect.get(result, 'email')).toBeUndefined();
    });

    it('should return 404 for non-existent publicId', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      await expect(profileService.getPublicProfile('not-found')).rejects.toMatchObject({
        code: 'PROFILE_NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('updateProfile', () => {
    it('should update bio and displayNamePublic', async () => {
      const updateData = {
        bio: 'New Bio',
        displayNamePublic: 'New Public Name'
      };

      const updatedUser = { id: 'user-1', ...updateData };
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user-1' } as never);
      vi.mocked(prisma.user.update).mockResolvedValue(updatedUser as never);

      const result = await profileService.updateProfile('user-1', updateData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: updateData
      });
      expect(result).toEqual(updatedUser);
    });

    it('should not update fields not provided', async () => {
      const updateData = {
        bio: 'Only Bio'
      };

      vi.mocked(prisma.user.update).mockResolvedValue({ id: 'user-1', ...updateData } as never);
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user-1' } as never);

      await profileService.updateProfile('user-1', updateData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: updateData
      });
    });
  });

  it('returns UserApiError 404 when the current user does not exist', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    await expect(profileService.getMyProfile('missing-user')).rejects.toBeInstanceOf(UserApiError);
    await expect(profileService.getMyProfile('missing-user')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('propagates database errors instead of fabricating a profile', async () => {
    const databaseError = new Error('database unavailable');
    vi.mocked(prisma.user.findFirst).mockRejectedValue(databaseError);

    await expect(profileService.getMyProfile('user-1')).rejects.toBe(databaseError);
  });
});
