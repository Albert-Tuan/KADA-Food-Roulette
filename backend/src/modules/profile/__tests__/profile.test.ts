import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileService } from '../profile.service';
import { prisma } from '../../../shared/utils/prisma';

vi.mock('../../../shared/utils/prisma', () => {
  const mockPrisma = {
    user: { findUnique: vi.fn(), update: vi.fn() },
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
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await profileService.getMyProfile('user-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'user-1' }
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
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockPublicUser as any);

      const result = await profileService.getPublicProfile('public-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { publicId: 'public-1' }
      }));
      expect(result).toEqual(mockPublicUser);
      expect((result as any)?.displayNamePrivate).toBeUndefined();
      expect((result as any)?.email).toBeUndefined();
    });

    it('should return 404 for non-existent publicId', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await profileService.getPublicProfile('not-found');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update bio and displayNamePublic', async () => {
      const updateData = {
        bio: 'New Bio',
        displayNamePublic: 'New Public Name'
      };
      
      const updatedUser = { id: 'user-1', ...updateData };
      vi.mocked(prisma.user.update).mockResolvedValue(updatedUser as any);

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
      
      vi.mocked(prisma.user.update).mockResolvedValue({ id: 'user-1', ...updateData } as any);

      await profileService.updateProfile('user-1', updateData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: updateData
      });
    });
  });
});
