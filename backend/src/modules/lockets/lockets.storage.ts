import type { LocketVisibility } from '@prisma/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createSupabaseServerClient,
  readSupabaseStorageConfig,
} from '../../lib/supabase.js';
import { LocketApiError } from './lockets.errors.js';
import type { ProcessedLocketImages } from './lockets.imageProcessor.js';
import { createSignedMediaUrl, MEDIA_URL_TTL_SECONDS } from './lockets.mediaAccess.js';

const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

export interface LocketMediaPaths {
  originalPath: string;
  thumbnailPath: string;
}

export interface LocketMediaUrls {
  imageUrl: string;
  thumbnailUrl: string;
}

export interface UploadLocketMediaInput {
  userId: string;
  locketId: string;
  images: ProcessedLocketImages;
}

export interface ReadLocketImage {
  buffer: Buffer;
  mimeType: string;
}

export interface MediaStorage {
  readonly mode: 'memory' | 'supabase' | 'unconfigured';
  upload(input: UploadLocketMediaInput): Promise<LocketMediaPaths>;
  getUrls(paths: LocketMediaPaths, visibility: LocketVisibility): Promise<LocketMediaUrls>;
  read(path: string): Promise<ReadLocketImage | null>;
  remove(paths: LocketMediaPaths): Promise<void>;
}

export function buildLocketMediaPaths(userId: string, locketId: string): LocketMediaPaths {
  if (!SAFE_ID_PATTERN.test(userId) || !SAFE_ID_PATTERN.test(locketId)) {
    throw new LocketApiError('LOCKET_STORAGE_PATH_INVALID', 'Không thể tạo đường dẫn lưu ảnh.', 500);
  }
  const prefix = `lockets/${userId}/${locketId}`;
  return {
    originalPath: `${prefix}/original.jpg`,
    thumbnailPath: `${prefix}/thumbnail.jpg`,
  };
}

export function isLocketMediaPath(path: string): boolean {
  const parts = path.split('/');
  return parts.length === 4
    && parts[0] === 'lockets'
    && SAFE_ID_PATTERN.test(parts[1])
    && SAFE_ID_PATTERN.test(parts[2])
    && (parts[3] === 'original.jpg' || parts[3] === 'thumbnail.jpg');
}

export class InMemoryMediaStorage implements MediaStorage {
  readonly mode = 'memory' as const;
  private readonly images = new Map<string, ReadLocketImage>();

  async upload(input: UploadLocketMediaInput): Promise<LocketMediaPaths> {
    const paths = buildLocketMediaPaths(input.userId, input.locketId);
    this.images.set(paths.originalPath, {
      buffer: Buffer.from(input.images.original),
      mimeType: input.images.mimeType,
    });
    this.images.set(paths.thumbnailPath, {
      buffer: Buffer.from(input.images.thumbnail),
      mimeType: input.images.mimeType,
    });
    return paths;
  }

  async getUrls(paths: LocketMediaPaths, visibility: LocketVisibility): Promise<LocketMediaUrls> {
    const urlFor = (path: string) => visibility === 'PUBLIC'
      ? `/api/v1/lockets/media/${path}`
      : createSignedMediaUrl(path);
    return {
      imageUrl: urlFor(paths.originalPath),
      thumbnailUrl: urlFor(paths.thumbnailPath),
    };
  }

  async read(path: string): Promise<ReadLocketImage | null> {
    return this.images.get(path) ?? null;
  }

  async remove(paths: LocketMediaPaths): Promise<void> {
    this.images.delete(paths.originalPath);
    this.images.delete(paths.thumbnailPath);
  }
}

export class SupabaseMediaStorage implements MediaStorage {
  readonly mode = 'supabase' as const;
  private privateBucketCheck?: Promise<void>;

  constructor(
    private readonly client: SupabaseClient,
    private readonly bucket: string,
  ) {}

  private files() {
    return this.client.storage.from(this.bucket);
  }

  private ensurePrivateBucket(): Promise<void> {
    this.privateBucketCheck ??= this.client.storage.getBucket(this.bucket).then((result) => {
      if (result.error) {
        console.warn(`[Supabase Storage] getBucket '${this.bucket}' notice:`, result.error.message);
        return;
      }
      if (result.data && result.data.public) {
        console.warn(`[Supabase Storage] Notice: bucket '${this.bucket}' is public.`);
      }
    }).catch((err) => {
      console.warn(`[Supabase Storage] ensurePrivateBucket notice:`, err);
    });
    return this.privateBucketCheck;
  }

  async upload(input: UploadLocketMediaInput): Promise<LocketMediaPaths> {
    await this.ensurePrivateBucket();
    const paths = buildLocketMediaPaths(input.userId, input.locketId);
    const options = {
      cacheControl: '0',
      contentType: input.images.mimeType,
      upsert: false,
    };

    const originalResult = await this.files().upload(paths.originalPath, input.images.original, options);
    if (originalResult.error) throw storageError('upload_original');

    const thumbnailResult = await this.files().upload(paths.thumbnailPath, input.images.thumbnail, options);
    if (thumbnailResult.error) {
      const cleanupResult = await this.files().remove([paths.originalPath]);
      if (cleanupResult.error) throw storageError('cleanup_original');
      throw storageError('upload_thumbnail');
    }
    return paths;
  }

  async getUrls(paths: LocketMediaPaths, visibility: LocketVisibility): Promise<LocketMediaUrls> {
    await this.ensurePrivateBucket();
    if (visibility === 'PUBLIC') {
      return {
        imageUrl: `/api/v1/lockets/media/${paths.originalPath}`,
        thumbnailUrl: `/api/v1/lockets/media/${paths.thumbnailPath}`,
      };
    }

    const [originalResult, thumbnailResult] = await Promise.all([
      this.files().createSignedUrl(paths.originalPath, MEDIA_URL_TTL_SECONDS),
      this.files().createSignedUrl(paths.thumbnailPath, MEDIA_URL_TTL_SECONDS),
    ]);
    if (originalResult.error || thumbnailResult.error) throw storageError('sign_urls');
    return {
      imageUrl: originalResult.data.signedUrl,
      thumbnailUrl: thumbnailResult.data.signedUrl,
    };
  }

  async read(path: string): Promise<ReadLocketImage | null> {
    if (!isLocketMediaPath(path)) return null;
    await this.ensurePrivateBucket();
    const result = await this.files().download(path);
    if (result.error) throw storageError('download');
    return {
      buffer: Buffer.from(await result.data.arrayBuffer()),
      mimeType: 'image/jpeg',
    };
  }

  async remove(paths: LocketMediaPaths): Promise<void> {
    await this.ensurePrivateBucket();
    const result = await this.files().remove([paths.originalPath, paths.thumbnailPath]);
    if (result.error) throw storageError('remove');
  }
}

export class UnconfiguredMediaStorage implements MediaStorage {
  readonly mode = 'unconfigured' as const;

  private unavailable(): never {
    throw new LocketApiError(
      'LOCKET_STORAGE_UNCONFIGURED',
      'Lưu ảnh chưa được cấu hình trên server.',
      503,
    );
  }

  async upload(): Promise<never> { return this.unavailable(); }
  async getUrls(): Promise<never> { return this.unavailable(); }
  async read(): Promise<null> { return null; }
  async remove(): Promise<never> { return this.unavailable(); }
}

function storageError(operation: string): LocketApiError {
  return new LocketApiError(
    'LOCKET_STORAGE_ERROR',
    `Không thể hoàn tất thao tác lưu ảnh (${operation}).`,
    502,
  );
}

function createMediaStorage(): MediaStorage {
  try {
    const config = readSupabaseStorageConfig();
    if (config) {
      return new SupabaseMediaStorage(createSupabaseServerClient(config), config.bucket);
    }
    return process.env.NODE_ENV === 'production'
      ? new UnconfiguredMediaStorage()
      : new InMemoryMediaStorage();
  } catch {
    return new UnconfiguredMediaStorage();
  }
}

export const locketStorage: MediaStorage = createMediaStorage();
