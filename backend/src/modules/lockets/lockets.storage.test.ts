import { describe, expect, it } from 'vitest';
import { InMemoryLocketStorage, PendingProductionLocketStorage } from './lockets.storage.js';

describe('Locket storage boundary', () => {
  it('stores and removes dev media without claiming EXIF stripping', async () => {
    const storage = new InMemoryLocketStorage();
    const stored = await storage.upload({ buffer: Buffer.from([1, 2, 3]), mimeType: 'image/jpeg' });

    expect(stored.exifStripped).toBe(false);
    expect(await storage.read(stored.key)).toMatchObject({ mimeType: 'image/jpeg' });
    await storage.remove(stored.key);
    expect(await storage.read(stored.key)).toBeNull();
  });

  it('fails closed when production storage is pending', async () => {
    const storage = new PendingProductionLocketStorage();
    await expect(storage.upload()).rejects.toMatchObject({ code: 'LOCKET_STORAGE_PENDING', statusCode: 503 });
  });
});
