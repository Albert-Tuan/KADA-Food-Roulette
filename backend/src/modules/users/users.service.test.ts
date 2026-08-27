import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserApiError } from './users.errors';
import { usersService } from './users.service';
import { prisma } from '../../shared/utils/prisma';
import { locketsService } from '../lockets/lockets.service';

vi.mock('../../shared/utils/prisma', () => {
  const mockPrisma = {
    user: { findFirst: vi.fn(), update: vi.fn() },
    locket: { count: vi.fn() },
    checkIn: { count: vi.fn() },
    groupMember: { count: vi.fn() },
  };
  return { prisma: mockPrisma, default: mockPrisma };
});

vi.mock('../lockets/lockets.service', () => ({
  locketsService: { getPublicForUser: vi.fn() },
}));

describe('UsersService profile persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.locket.count).mockResolvedValue(0);
    vi.mocked(prisma.checkIn.count).mockResolvedValue(0);
    vi.mocked(prisma.groupMember.count).mockResolvedValue(0);
    vi.mocked(locketsService.getPublicForUser).mockResolvedValue([]);
  });

  it('throws UserApiError 404 for a missing private profile', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    await expect(usersService.getMyProfile('missing-user')).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
      statusCode: 404,
    });
    expect(locketsService.getPublicForUser).not.toHaveBeenCalled();
  });

  it('throws UserApiError 404 for a missing public profile', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    await expect(usersService.getPublicProfile('missing-public-id')).rejects.toBeInstanceOf(UserApiError);
  });

  it('propagates profile database errors', async () => {
    const databaseError = new Error('database unavailable');
    vi.mocked(prisma.user.findFirst).mockRejectedValue(databaseError);

    await expect(usersService.getMyProfile('user-1')).rejects.toBe(databaseError);
  });

  it('propagates stats database errors', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      displayNamePrivate: 'Private Name',
      displayNamePublic: 'Public Name',
      publicId: 'public-1',
      avatarUrl: null,
      bio: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    } as never);
    const databaseError = new Error('stats unavailable');
    vi.mocked(prisma.locket.count).mockRejectedValue(databaseError);

    await expect(usersService.getMyProfile('user-1')).rejects.toBe(databaseError);
  });

  it('does not update a missing private profile', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    await expect(usersService.updateMyProfile('missing-user', { bio: 'Bio' })).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
      statusCode: 404,
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
