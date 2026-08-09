import { randomUUID } from 'node:crypto';
import { LocketApiError } from './lockets.errors.js';

export interface StoredLocketImage {
  key: string;
  imageUrl: string;
  exifStripped: boolean;
}

export interface ReadLocketImage {
  buffer: Buffer;
  mimeType: string;
}

export interface LocketStorageAdapter {
  readonly mode: 'memory' | 'pending';
  upload(input: { buffer: Buffer; mimeType: string }): Promise<StoredLocketImage>;
  read(key: string): Promise<ReadLocketImage | null>;
  remove(key: string): Promise<void>;
}

export class InMemoryLocketStorage implements LocketStorageAdapter {
  readonly mode = 'memory' as const;
  private readonly images = new Map<string, ReadLocketImage>();

  async upload(input: { buffer: Buffer; mimeType: string }): Promise<StoredLocketImage> {
    const extension = input.mimeType === 'image/png' ? 'png' : 'jpg';
    const key = `${randomUUID()}.${extension}`;
    this.images.set(key, { buffer: Buffer.from(input.buffer), mimeType: input.mimeType });
    return {
      key,
      imageUrl: `/api/v1/lockets/media/${key}`,
      exifStripped: false,
    };
  }

  async read(key: string): Promise<ReadLocketImage | null> {
    return this.images.get(key) ?? null;
  }

  async remove(key: string): Promise<void> {
    this.images.delete(key);
  }
}

export class PendingProductionLocketStorage implements LocketStorageAdapter {
  readonly mode = 'pending' as const;

  async upload(): Promise<never> {
    throw new LocketApiError(
      'LOCKET_STORAGE_PENDING',
      'Lưu ảnh production đang chờ cấu hình Supabase Storage.',
      503,
    );
  }

  async read(): Promise<null> {
    return null;
  }

  async remove(): Promise<void> {}
}

export const locketStorage: LocketStorageAdapter = process.env.NODE_ENV === 'production'
  ? new PendingProductionLocketStorage()
  : new InMemoryLocketStorage();
