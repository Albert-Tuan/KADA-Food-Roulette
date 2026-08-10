import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import type { ProcessedLocketImages } from './lockets.imageProcessor.js';
import {
  buildLocketMediaPaths,
  InMemoryMediaStorage,
  SupabaseMediaStorage,
  UnconfiguredMediaStorage,
} from './lockets.storage.js';

const userId = '11111111-1111-4111-8111-111111111111';
const locketId = '22222222-2222-4222-8222-222222222222';
const paths = buildLocketMediaPaths(userId, locketId);
const images: ProcessedLocketImages = {
  original: Buffer.from([1, 2, 3]),
  thumbnail: Buffer.from([4, 5]),
  width: 800,
  height: 600,
  originalBytes: 3,
  thumbnailBytes: 2,
  mimeType: 'image/jpeg',
  exifStripped: true,
};

function createStorageClient(bucket: object, isPublic = false): SupabaseClient {
  return {
    storage: {
      from: vi.fn(() => bucket),
      getBucket: vi.fn(async () => ({
        data: { id: 'lockets', name: 'lockets', public: isPublic },
        error: null,
      })),
    },
  } as unknown as SupabaseClient;
}

describe('Locket MediaStorage', () => {
  it('builds the approved storage paths from server-side UUIDs', () => {
    expect(paths).toEqual({
      originalPath: `lockets/${userId}/${locketId}/original.jpg`,
      thumbnailPath: `lockets/${userId}/${locketId}/thumbnail.jpg`,
    });
  });

  it('stores both normalized images in the local fallback', async () => {
    const storage = new InMemoryMediaStorage();
    const stored = await storage.upload({ userId, locketId, images });

    expect(await storage.read(stored.originalPath)).toMatchObject({ mimeType: 'image/jpeg' });
    expect((await storage.getUrls(stored, 'PUBLIC')).imageUrl).toContain('/api/v1/lockets/media/lockets/');
    expect((await storage.getUrls(stored, 'PRIVATE')).imageUrl).toContain('signature=');
    await storage.remove(stored);
    expect(await storage.read(stored.thumbnailPath)).toBeNull();
  });

  it('uses the Express proxy for PUBLIC and one-hour signed URLs otherwise', async () => {
    const bucket = {
      createSignedUrl: vi.fn(async (path: string, ttl: number) => ({
        data: { signedUrl: `https://signed.example/${path}?ttl=${ttl}` },
        error: null,
      })),
    };
    const client = createStorageClient(bucket);
    const storage = new SupabaseMediaStorage(client, 'lockets');

    expect((await storage.getUrls(paths, 'PUBLIC')).imageUrl).toBe(
      `/api/v1/lockets/media/${paths.originalPath}`,
    );
    expect((await storage.getUrls(paths, 'FRIENDS')).thumbnailUrl).toContain('ttl=3600');
  });

  it('downloads private-bucket media for the authorized Express proxy', async () => {
    const download = vi.fn(async () => ({
      data: new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' }),
      error: null,
    }));
    const bucket = { download };
    const client = createStorageClient(bucket);
    const storage = new SupabaseMediaStorage(client, 'lockets');

    await expect(storage.read(paths.originalPath)).resolves.toEqual({
      buffer: Buffer.from([1, 2, 3]),
      mimeType: 'image/jpeg',
    });
    expect(download).toHaveBeenCalledWith(paths.originalPath);
  });

  it('removes the original if thumbnail upload fails', async () => {
    const upload = vi.fn()
      .mockResolvedValueOnce({ data: { path: paths.originalPath }, error: null })
      .mockResolvedValueOnce({ data: null, error: new Error('provider failure') });
    const remove = vi.fn().mockResolvedValue({ data: [], error: null });
    const bucket = { upload, remove };
    const client = createStorageClient(bucket);
    const storage = new SupabaseMediaStorage(client, 'lockets');

    await expect(storage.upload({ userId, locketId, images })).rejects.toMatchObject({
      code: 'LOCKET_STORAGE_ERROR',
    });
    expect(upload).toHaveBeenNthCalledWith(1, paths.originalPath, images.original, {
      cacheControl: '0',
      contentType: 'image/jpeg',
      upsert: false,
    });
    expect(remove).toHaveBeenCalledWith([paths.originalPath]);
  });

  it('fails closed when the configured Supabase bucket is public', async () => {
    const storage = new SupabaseMediaStorage(createStorageClient({}, true), 'lockets');

    await expect(storage.getUrls(paths, 'PUBLIC')).rejects.toMatchObject({
      code: 'LOCKET_STORAGE_BUCKET_INVALID',
      statusCode: 503,
    });
  });

  it('fails closed when production storage is unconfigured', async () => {
    const storage = new UnconfiguredMediaStorage();
    await expect(storage.upload()).rejects.toMatchObject({
      code: 'LOCKET_STORAGE_UNCONFIGURED',
      statusCode: 503,
    });
  });
});
