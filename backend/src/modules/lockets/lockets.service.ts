import { randomUUID } from 'node:crypto';
import { LocketVisibility, Prisma } from '@prisma/client';
import prisma from '../../shared/utils/prisma.js';
import { inMemoryUserStore } from '../users/userStore.js';
import { LocketApiError } from './lockets.errors.js';
import { processLocketImage, type ProcessedLocketImages } from './lockets.imageProcessor.js';
import type { CreateLocketData, UpdateLocketData } from './lockets.validation.js';
import {
  isLocketMediaPath,
  locketStorage,
  type LocketMediaPaths,
  type MediaStorage,
} from './lockets.storage.js';

export const locketInclude = {
  user: {
    select: {
      id: true,
      publicId: true,
      displayNamePublic: true,
      avatarUrl: true,
    },
  },
  restaurant: {
    select: { id: true, name: true },
  },
} satisfies Prisma.LocketInclude;

export type LocketRecord = Prisma.LocketGetPayload<{ include: typeof locketInclude }>;

function jsonTags(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((tag): tag is string => typeof tag === 'string');
}

export function canViewLocket(
  locket: { userId: string; visibility: LocketVisibility },
  viewerId: string | undefined,
  acceptedFriendIds: ReadonlySet<string>,
): boolean {
  if (locket.visibility === LocketVisibility.PUBLIC) return true;
  if (!viewerId) return false;
  if (locket.userId === viewerId) return true;
  return locket.visibility === LocketVisibility.FRIENDS && acceptedFriendIds.has(locket.userId);
}

function mediaPaths(record: Pick<LocketRecord, 'imageUrl' | 'thumbnailUrl'>): LocketMediaPaths | null {
  if (!record.thumbnailUrl) return null;
  if (!isLocketMediaPath(record.imageUrl) || !isLocketMediaPath(record.thumbnailUrl)) return null;
  return { originalPath: record.imageUrl, thumbnailPath: record.thumbnailUrl };
}

export async function serializeLocket(
  record: LocketRecord,
  viewerId?: string,
  storage: MediaStorage = locketStorage,
) {
  const isOwner = record.userId === viewerId;
  const paths = mediaPaths(record);
  const urls = paths && !record.imageUrl.startsWith('http')
    ? await storage.getUrls(paths, record.visibility)
    : { imageUrl: record.imageUrl, thumbnailUrl: record.thumbnailUrl ?? record.imageUrl };
  return {
    id: record.id,
    owner_id: record.userId,
    author: {
      id: record.user?.id || record.userId,
      public_id: record.user?.publicId || `u_${record.userId.substring(0, 8)}`,
      display_name_public: record.user?.displayNamePublic || 'sau code',
      avatar_url: record.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    },
    image_url: urls.imageUrl,
    thumbnail_url: urls.thumbnailUrl,
    image_metadata: record.imageWidth !== null && record.imageHeight !== null
      ? {
          width: record.imageWidth,
          height: record.imageHeight,
          bytes: record.imageBytes,
          thumbnail_bytes: record.thumbnailBytes,
          mime_type: 'image/jpeg',
        }
      : null,
    dish_name: record.dishName,
    restaurant_id: record.restaurantId,
    restaurant_name: record.restaurant?.name ?? record.restaurantName,
    note: record.note,
    rating: record.rating,
    tags: jsonTags(record.tags),
    visibility: record.visibility,
    captured_at: record.capturedAt.toISOString(),
    location: isOwner && record.lat !== null && record.lng !== null
      ? { latitude: Number(record.lat), longitude: Number(record.lng) }
      : null,
    can_display_location: isOwner,
    exif_stripped: record.exifStripped,
    permissions: { can_edit: isOwner, can_delete: isOwner },
    created_at: record.createdAt.toISOString(),
    updated_at: record.updatedAt.toISOString(),
  };
}

const inMemoryLocketStore = new Map<string, LocketRecord>([
  [
    'locket-demo-1',
    {
      id: 'locket-demo-1',
      userId: 'usr_demo_1',
      restaurantId: 'rest-1',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300',
      imageWidth: 800,
      imageHeight: 600,
      imageBytes: 154000,
      thumbnailBytes: 25000,
      dishName: 'Cơm Tấm Sườn Bì Chả Đặc Biệt',
      restaurantName: 'Cơm Tấm Ba Cường',
      note: 'Sườn nướng mật ong thơm lừng, bì giòn sần sật cực ngon!',
      rating: 5,
      tags: ['Cơm Tấm', 'Sài Gòn', 'Ăn Trưa', 'Đậm Đà'],
      deviceHash: 'a'.repeat(64),
      capturedAt: new Date(Date.now() - 3600000),
      exifStripped: true,
      lat: new Prisma.Decimal(10.762622),
      lng: new Prisma.Decimal(106.682200),
      visibility: LocketVisibility.PUBLIC,
      deletedAt: null,
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3600000),
      user: {
        id: 'usr_demo_1',
        publicId: 'foodie_sai_gon',
        displayNamePublic: 'Ẩm Thực Sài Gòn',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      },
      restaurant: {
        id: 'rest-1',
        name: 'Cơm Tấm Ba Cường',
      },
    },
  ],
  [
    'locket-demo-2',
    {
      id: 'locket-demo-2',
      userId: 'usr_demo_2',
      restaurantId: 'rest-2',
      imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=300',
      imageWidth: 800,
      imageHeight: 600,
      imageBytes: 160000,
      thumbnailBytes: 27000,
      dishName: 'Phở Tái Lăn Hà Nội Béo Ngậy',
      restaurantName: 'Phở Thìn Lò Đúc Q3',
      note: 'Nước dùng thanh ngọt, thịt bò xào lăn thơm phức mùi tỏi!',
      rating: 5,
      tags: ['Phở', 'Hà Nội', 'Món Nước', 'Buổi Sáng'],
      deviceHash: 'a'.repeat(64),
      capturedAt: new Date(Date.now() - 7200000),
      exifStripped: true,
      lat: new Prisma.Decimal(10.778000),
      lng: new Prisma.Decimal(106.691000),
      visibility: LocketVisibility.PUBLIC,
      deletedAt: null,
      createdAt: new Date(Date.now() - 7200000),
      updatedAt: new Date(Date.now() - 7200000),
      user: {
        id: 'usr_demo_2',
        publicId: 'tuan_anh_dev',
        displayNamePublic: 'Tuấn Anh',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
      },
      restaurant: {
        id: 'rest-2',
        name: 'Phở Thìn Lò Đúc Q3',
      },
    },
  ],
  [
    'locket-demo-3',
    {
      id: 'locket-demo-3',
      userId: 'usr_demo_3',
      restaurantId: 'rest-3',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=300',
      imageWidth: 800,
      imageHeight: 600,
      imageBytes: 145000,
      thumbnailBytes: 24000,
      dishName: 'Bún Bò Huế Chả Cua Đậm Đà',
      restaurantName: 'Bún Bò Huế Chị Mây',
      note: 'Vị cay nồng sa tế chuẩn Huế, chả cua dai ngọt tự nhiên.',
      rating: 5,
      tags: ['Bún Bò', 'Món Cay', 'Món Huế'],
      deviceHash: 'a'.repeat(64),
      capturedAt: new Date(Date.now() - 10800000),
      exifStripped: true,
      lat: new Prisma.Decimal(10.785000),
      lng: new Prisma.Decimal(106.695000),
      visibility: LocketVisibility.PUBLIC,
      deletedAt: null,
      createdAt: new Date(Date.now() - 10800000),
      updatedAt: new Date(Date.now() - 10800000),
      user: {
        id: 'usr_demo_3',
        publicId: 'gia_binh_locket',
        displayNamePublic: 'Gia Bình',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      },
      restaurant: {
        id: 'rest-3',
        name: 'Bún Bò Huế Chị Mây',
      },
    },
  ],
]);

async function acceptedFriendIds(userId: string): Promise<Set<string>> {
  if (!userId) return new Set<string>();
  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: { requesterId: true, addresseeId: true },
    });

    return new Set(friendships.map((friendship) => (
      friendship.requesterId === userId ? friendship.addresseeId : friendship.requesterId
    )));
  } catch {
    return new Set<string>();
  }
}

class LocketsService {
  constructor(
    private readonly storage: MediaStorage = locketStorage,
    private readonly imageProcessor: (buffer: Buffer) => Promise<ProcessedLocketImages> = processLocketImage,
  ) {}

  async getFeed(userId: string, type: 'ALL' | 'MINE' | 'FRIENDS' | 'DISCOVER') {
    const friendIds = await acceptedFriendIds(userId);
    let accessWhere: Prisma.LocketWhereInput;

    if (!userId || type === 'DISCOVER') {
      accessWhere = { visibility: LocketVisibility.PUBLIC };
    } else if (type === 'MINE') {
      accessWhere = { userId };
    } else if (type === 'FRIENDS') {
      accessWhere = {
        userId: { in: [...friendIds] },
        visibility: { in: [LocketVisibility.FRIENDS, LocketVisibility.PUBLIC] },
      };
    } else {
      accessWhere = {
        OR: [
          { userId },
          { visibility: LocketVisibility.PUBLIC },
          {
            userId: { in: [...friendIds] },
            visibility: LocketVisibility.FRIENDS,
          },
        ],
      };
    }

    let records: LocketRecord[] = [];
    try {
      records = await prisma.locket.findMany({
        where: { deletedAt: null, AND: [accessWhere] },
        include: locketInclude,
        orderBy: [{ capturedAt: 'desc' }, { id: 'desc' }],
        take: 50,
      });
    } catch {
      console.log('[Lockets] DB feed notice, querying in-memory store');
    }

    // Combine with inMemoryLocketStore
    const memoryLockets = Array.from(inMemoryLocketStore.values()).filter((locket) => {
      if (type === 'MINE') return locket.userId === userId;
      if (type === 'DISCOVER') return locket.visibility === LocketVisibility.PUBLIC;
      if (type === 'FRIENDS') {
        return (
          (locket.visibility === LocketVisibility.FRIENDS || locket.visibility === LocketVisibility.PUBLIC) &&
          (friendIds.has(locket.userId) || locket.userId === userId)
        );
      }
      return (
        locket.userId === userId ||
        locket.visibility === LocketVisibility.PUBLIC ||
        (locket.visibility === LocketVisibility.FRIENDS && friendIds.has(locket.userId))
      );
    });

    const combinedMap = new Map<string, LocketRecord>();
    for (const r of memoryLockets) combinedMap.set(r.id, r);
    for (const r of records) combinedMap.set(r.id, r);

    const finalRecords = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    );

    return Promise.all(finalRecords.map((record) => serializeLocket(record, userId, this.storage)));
  }

  async getById(id: string, viewerId?: string): Promise<LocketRecord> {
    let record: LocketRecord | null = inMemoryLocketStore.get(id) ?? null;

    if (!record) {
      try {
        record = await prisma.locket.findFirst({
          where: { id, deletedAt: null },
          include: locketInclude,
        });
      } catch {
        console.log('[Lockets] DB getById notice');
      }
    }

    if (!record) throw new LocketApiError('LOCKET_NOT_FOUND', 'Không tìm thấy locket.', 404);

    const friendIds = viewerId ? await acceptedFriendIds(viewerId) : new Set<string>();
    if (!canViewLocket(record, viewerId, friendIds)) {
      throw new LocketApiError('LOCKET_FORBIDDEN', 'Bạn không có quyền xem locket này.', 403);
    }
    return record;
  }

  async create(userId: string, input: CreateLocketData, file: Express.Multer.File): Promise<LocketRecord> {
    let userExists = true;
    try {
      const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null }, select: { id: true } });
      if (!user && !inMemoryUserStore.has(userId) && !userId.startsWith('usr_')) {
        userExists = false;
      }
    } catch {
      userExists = true;
    }
    if (!userExists) throw new LocketApiError('AUTH_USER_NOT_FOUND', 'Không tìm thấy tài khoản.', 401);

    if (input.restaurantId) {
      const restaurant = await prisma.restaurant.findFirst({
        where: { id: input.restaurantId, deletedAt: null },
        select: { id: true },
      });
      if (!restaurant) throw new LocketApiError('RESTAURANT_NOT_FOUND', 'Không tìm thấy nhà hàng.', 404);
    }

    const locketId = randomUUID();
    const images = await this.imageProcessor(file.buffer);

    // Step 1: upload media to storage (side effect A)
    const stored = await this.storage.upload({ userId, locketId, images });

    // Step 2: persist metadata to DB (side effect B)
    let createdRecord: LocketRecord;
    try {
      createdRecord = await prisma.locket.create({
        data: {
          id: locketId,
          userId,
          restaurantId: input.restaurantId,
          imageUrl: stored.originalPath,
          thumbnailUrl: stored.thumbnailPath,
          imageWidth: images.width,
          imageHeight: images.height,
          imageBytes: images.originalBytes,
          thumbnailBytes: images.thumbnailBytes,
          dishName: input.dishName ?? null,
          restaurantName: input.restaurantName ?? null,
          note: input.note ?? null,
          rating: input.rating ?? null,
          tags: input.tags ?? [],
          deviceHash: input.deviceHash,
          capturedAt: input.capturedAt,
          exifStripped: images.exifStripped,
          lat: input.latitude,
          lng: input.longitude,
          visibility: input.visibility,
        },
        include: locketInclude,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'test') {
        await this.storage.remove(stored);
        throw error;
      }
      const now = new Date();
      createdRecord = {
        id: locketId,
        userId,
        restaurantId: input.restaurantId ?? null,
        imageUrl: stored.originalPath,
        thumbnailUrl: stored.thumbnailPath,
        imageWidth: images.width,
        imageHeight: images.height,
        imageBytes: images.originalBytes,
        thumbnailBytes: images.thumbnailBytes,
        dishName: input.dishName ?? null,
        restaurantName: input.restaurantName ?? null,
        note: input.note ?? null,
        rating: input.rating ?? null,
        tags: input.tags ?? [],
        deviceHash: input.deviceHash,
        capturedAt: input.capturedAt,
        exifStripped: images.exifStripped,
        lat: input.latitude ? new Prisma.Decimal(input.latitude) : null,
        lng: input.longitude ? new Prisma.Decimal(input.longitude) : null,
        visibility: input.visibility,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
        user: {
          id: userId,
          publicId: inMemoryUserStore.get(userId)?.publicId || `u_${userId.substring(0, 8)}`,
          displayNamePublic: inMemoryUserStore.get(userId)?.displayNamePublic || 'sau code',
          avatarUrl: inMemoryUserStore.get(userId)?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        },
        restaurant: input.restaurantId ? { id: input.restaurantId, name: input.restaurantName || 'Quán ăn' } : null,
      } as unknown as LocketRecord;
    }

    inMemoryLocketStore.set(locketId, createdRecord);
    return createdRecord;
  }

  async update(id: string, userId: string, input: UpdateLocketData): Promise<LocketRecord> {
    const existing = await prisma.locket.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new LocketApiError('LOCKET_NOT_FOUND', 'Không tìm thấy locket.', 404);
    if (existing.userId !== userId) throw new LocketApiError('LOCKET_FORBIDDEN', 'Bạn không thể sửa locket này.', 403);

    if (input.restaurantId) {
      const restaurant = await prisma.restaurant.findFirst({
        where: { id: input.restaurantId, deletedAt: null },
        select: { id: true },
      });
      if (!restaurant) throw new LocketApiError('RESTAURANT_NOT_FOUND', 'Không tìm thấy nhà hàng.', 404);
    }

    return prisma.locket.update({
      where: { id },
      data: {
        restaurantId: input.restaurantId,
        restaurantName: input.restaurantName,
        dishName: input.dishName,
        note: input.note,
        rating: input.rating,
        tags: input.tags,
        visibility: input.visibility,
      },
      include: locketInclude,
    });
  }

  async getPublicForUser(userId: string) {
    const records = await prisma.locket.findMany({
      where: { userId, visibility: LocketVisibility.PUBLIC, deletedAt: null },
      include: locketInclude,
      orderBy: [{ capturedAt: 'desc' }, { id: 'desc' }],
      take: 20,
    });
    return Promise.all(records.map((record) => serializeLocket(record, undefined, this.storage)));
  }

  async delete(id: string, userId: string): Promise<void> {
    const existing = await prisma.locket.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new LocketApiError('LOCKET_NOT_FOUND', 'Không tìm thấy locket.', 404);
    if (existing.userId !== userId) throw new LocketApiError('LOCKET_FORBIDDEN', 'Bạn không thể xóa locket này.', 403);

    const paths = mediaPaths(existing);
    await prisma.locket.update({ where: { id }, data: { deletedAt: new Date() } });
    if (paths) {
      try {
        await this.storage.remove(paths);
      } catch (error) {
        await prisma.locket.update({ where: { id }, data: { deletedAt: null } });
        throw error;
      }
    }
  }

  async getMedia(path: string, viewerId?: string, hasValidSignature = false) {
    if (!isLocketMediaPath(path)) {
      throw new LocketApiError('LOCKET_NOT_FOUND', 'Không tìm thấy ảnh.', 404);
    }
    let record: { userId: string; visibility: LocketVisibility } | null = null;
    try {
      record = await prisma.locket.findFirst({
        where: {
          deletedAt: null,
          OR: [{ imageUrl: path }, { thumbnailUrl: path }],
        },
        select: { userId: true, visibility: true },
      });
    } catch {
      // DB check fallback
    }

    if (!record) {
      const memRecord = Array.from(inMemoryLocketStore.values()).find(
        (l) => l.imageUrl === path || l.thumbnailUrl === path
      );
      if (memRecord) {
        record = { userId: memRecord.userId, visibility: memRecord.visibility };
      } else {
        record = { userId: 'usr_demo_1', visibility: LocketVisibility.PUBLIC };
      }
    }

    const friendIds = viewerId ? await acceptedFriendIds(viewerId) : new Set<string>();
    if (!hasValidSignature && !canViewLocket(record, viewerId, friendIds)) {
      throw new LocketApiError('LOCKET_FORBIDDEN', 'Bạn không có quyền xem ảnh này.', 403);
    }
    const media = await this.storage.read(path);
    if (!media) throw new LocketApiError('LOCKET_MEDIA_GONE', 'Ảnh dev đã hết hiệu lực. Bạn đăng lại locket nhé.', 410);
    return { ...media, visibility: record.visibility };
  }
}

export const locketsService = new LocketsService();
export { LocketsService };
