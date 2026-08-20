import { LocketVisibility } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProcessedLocketImages } from './lockets.imageProcessor.js';
import { LocketsService } from './lockets.service.js';
import type { LocketMediaPaths, MediaStorage } from './lockets.storage.js';
import type { CreateLocketData } from './lockets.validation.js';

const prismaMock = vi.hoisted(() => ({
  user: { findFirst: vi.fn() },
  restaurant: { findFirst: vi.fn() },
  locket: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
  friendship: { findMany: vi.fn() },
}));

vi.mock('../../shared/utils/prisma.js', () => ({ default: prismaMock }));

const userId = '11111111-1111-4111-8111-111111111111';
const locketId = '22222222-2222-4222-8222-222222222222';
const paths: LocketMediaPaths = {
  originalPath: `lockets/${userId}/${locketId}/original.jpg`,
  thumbnailPath: `lockets/${userId}/${locketId}/thumbnail.jpg`,
};
const images: ProcessedLocketImages = {
  original: Buffer.from([1]),
  thumbnail: Buffer.from([2]),
  width: 1,
  height: 1,
  originalBytes: 1,
  thumbnailBytes: 1,
  mimeType: 'image/jpeg',
  exifStripped: true,
};

function createStorage() {
  return {
    mode: 'memory' as const,
    upload: vi.fn(async () => paths),
    getUrls: vi.fn(),
    read: vi.fn(),
    remove: vi.fn(async () => undefined),
  } satisfies MediaStorage;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Locket media lifecycle', () => {
  it('surfaces friendship lookup failures instead of widening feed access', async () => {
    const service = new LocketsService(createStorage(), async () => images);
    prismaMock.friendship.findMany.mockRejectedValue(new Error('friendship database unavailable'));

    await expect(service.getFeed(userId, 'ALL')).rejects.toThrow('friendship database unavailable');
    expect(prismaMock.locket.findMany).not.toHaveBeenCalled();
  });

  it('surfaces feed query failures instead of returning demo records', async () => {
    const service = new LocketsService(createStorage(), async () => images);
    prismaMock.friendship.findMany.mockResolvedValue([]);
    prismaMock.locket.findMany.mockRejectedValue(new Error('locket database unavailable'));

    await expect(service.getFeed(userId, 'ALL')).rejects.toThrow('locket database unavailable');
  });

  it('surfaces detail query failures instead of returning a demo record', async () => {
    const service = new LocketsService(createStorage(), async () => images);
    prismaMock.locket.findFirst.mockRejectedValue(new Error('locket database unavailable'));

    await expect(service.getById('locket-demo-1', userId)).rejects.toThrow('locket database unavailable');
  });

  it('removes uploaded objects when Prisma persistence fails', async () => {
    const storage = createStorage();
    const service = new LocketsService(storage, async () => images);
    const input: CreateLocketData = {
      visibility: LocketVisibility.PRIVATE,
      latitude: 10.7769,
      longitude: 106.7009,
      capturedAt: new Date(),
      deviceHash: 'a'.repeat(64),
    };
    prismaMock.user.findFirst.mockResolvedValue({ id: userId });
    prismaMock.locket.create.mockRejectedValue(new Error('database unavailable'));

    await expect(service.create(
      userId,
      input,
      { buffer: Buffer.from([1]), size: 1 } as Express.Multer.File,
    )).rejects.toThrow('database unavailable');
    expect(storage.remove).toHaveBeenCalledWith(paths);
  });

  it('restores the soft-delete marker when object cleanup fails', async () => {
    const storage = createStorage();
    storage.remove.mockRejectedValueOnce(new Error('storage unavailable'));
    const service = new LocketsService(storage, async () => images);
    prismaMock.locket.findFirst.mockResolvedValue({
      id: locketId,
      userId,
      imageUrl: paths.originalPath,
      thumbnailUrl: paths.thumbnailPath,
    });
    prismaMock.locket.update.mockResolvedValue({ id: locketId });

    await expect(service.delete(locketId, userId)).rejects.toThrow('storage unavailable');
    expect(prismaMock.locket.update).toHaveBeenNthCalledWith(1, {
      where: { id: locketId },
      data: { deletedAt: expect.any(Date) },
    });
    expect(prismaMock.locket.update).toHaveBeenNthCalledWith(2, {
      where: { id: locketId },
      data: { deletedAt: null },
    });
  });

  it('serves proxy bytes anonymously only while the Locket is public', async () => {
    const storage = createStorage();
    storage.read.mockResolvedValue({ buffer: Buffer.from([1, 2]), mimeType: 'image/jpeg' });
    const service = new LocketsService(storage, async () => images);
    prismaMock.locket.findFirst.mockResolvedValue({
      userId,
      visibility: LocketVisibility.PUBLIC,
    });

    await expect(service.getMedia(paths.originalPath)).resolves.toMatchObject({
      visibility: LocketVisibility.PUBLIC,
      mimeType: 'image/jpeg',
    });

    prismaMock.locket.findFirst.mockResolvedValue({
      userId,
      visibility: LocketVisibility.PRIVATE,
    });
    await expect(service.getMedia(paths.originalPath)).rejects.toMatchObject({
      code: 'LOCKET_FORBIDDEN',
      statusCode: 403,
    });
  });

  it('accepts a valid capability for non-public fallback media', async () => {
    const storage = createStorage();
    storage.read.mockResolvedValue({ buffer: Buffer.from([1]), mimeType: 'image/jpeg' });
    const service = new LocketsService(storage, async () => images);
    prismaMock.locket.findFirst.mockResolvedValue({
      userId,
      visibility: LocketVisibility.FRIENDS,
    });

    await expect(service.getMedia(paths.thumbnailPath, undefined, true)).resolves.toMatchObject({
      visibility: LocketVisibility.FRIENDS,
    });
  });
});
