import { LocketVisibility } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocketsService, serializeLocket, type LocketRecord } from './lockets.service.js';
import type { MediaStorage } from './lockets.storage.js';

const prismaMock = vi.hoisted(() => ({
  friendship: { findMany: vi.fn() },
  locket: { findFirst: vi.fn() },
  locketLike: { upsert: vi.fn(), deleteMany: vi.fn(), count: vi.fn() },
}));

vi.mock('../../shared/utils/prisma.js', () => ({ default: prismaMock }));

const ownerId = '11111111-1111-4111-8111-111111111111';
const viewerId = '22222222-2222-4222-8222-222222222222';
const locketId = '33333333-3333-4333-8333-333333333333';

function createStorage(): MediaStorage {
  return {
    mode: 'memory',
    upload: vi.fn(),
    getUrls: vi.fn(),
    read: vi.fn(),
    remove: vi.fn(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.friendship.findMany.mockResolvedValue([]);
  prismaMock.locket.findFirst.mockResolvedValue({
    id: locketId,
    userId: ownerId,
    visibility: LocketVisibility.PUBLIC,
  });
});

describe('Locket likes', () => {
  it('serializes a newly created Locket with zero likes', async () => {
    const now = new Date();
    const record = {
      id: locketId,
      userId: ownerId,
      restaurantId: null,
      imageUrl: 'https://media.example/original.jpg',
      thumbnailUrl: 'https://media.example/thumbnail.jpg',
      imageWidth: 1200,
      imageHeight: 1200,
      imageBytes: 100,
      thumbnailBytes: 20,
      dishName: null,
      restaurantName: null,
      note: null,
      rating: null,
      tags: [],
      deviceHash: 'a'.repeat(64),
      capturedAt: now,
      exifStripped: true,
      lat: null,
      lng: null,
      visibility: LocketVisibility.PUBLIC,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      user: {
        id: ownerId,
        publicId: 'owner',
        displayNamePublic: 'Owner',
        avatarUrl: null,
      },
      restaurant: null,
      likes: [],
      _count: { likes: 0 },
    } satisfies LocketRecord;

    await expect(serializeLocket(record, ownerId, createStorage())).resolves.toMatchObject({
      like_count: 0,
      is_liked: false,
    });
  });

  it('stores one like per authenticated user and returns the real count', async () => {
    const service = new LocketsService(createStorage());
    prismaMock.locketLike.upsert.mockResolvedValue({ locketId, userId: viewerId });
    prismaMock.locketLike.count.mockResolvedValue(1);

    await expect(service.like(locketId, viewerId)).resolves.toEqual({
      is_liked: true,
      like_count: 1,
    });
    expect(prismaMock.locketLike.upsert).toHaveBeenCalledWith({
      where: { locketId_userId: { locketId, userId: viewerId } },
      update: {},
      create: { locketId, userId: viewerId },
    });
  });

  it('removes only the current user reaction and returns the remaining count', async () => {
    const service = new LocketsService(createStorage());
    prismaMock.locketLike.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.locketLike.count.mockResolvedValue(2);

    await expect(service.unlike(locketId, viewerId)).resolves.toEqual({
      is_liked: false,
      like_count: 2,
    });
    expect(prismaMock.locketLike.deleteMany).toHaveBeenCalledWith({
      where: { locketId, userId: viewerId },
    });
  });

  it('does not reveal or mutate a Locket the viewer cannot access', async () => {
    const service = new LocketsService(createStorage());
    prismaMock.locket.findFirst.mockResolvedValue({
      id: locketId,
      userId: ownerId,
      visibility: LocketVisibility.PRIVATE,
    });

    await expect(service.like(locketId, viewerId)).rejects.toMatchObject({
      code: 'LOCKET_FORBIDDEN',
      statusCode: 403,
    });
    expect(prismaMock.locketLike.upsert).not.toHaveBeenCalled();
  });
});
