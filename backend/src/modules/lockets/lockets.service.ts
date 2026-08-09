import { LocketVisibility, Prisma } from '@prisma/client';
import prisma from '../../shared/utils/prisma.js';
import { LocketApiError } from './lockets.errors.js';
import { createSignedMediaUrl } from './lockets.mediaAccess.js';
import type { CreateLocketData, UpdateLocketData } from './lockets.validation.js';
import { locketStorage, type LocketStorageAdapter } from './lockets.storage.js';

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

export function serializeLocket(record: LocketRecord, viewerId?: string) {
  const isOwner = record.userId === viewerId;
  const imageUrl = record.visibility === LocketVisibility.PUBLIC
    ? record.imageUrl
    : createSignedMediaUrl(record.imageUrl);
  return {
    id: record.id,
    owner_id: record.userId,
    author: {
      id: record.user.id,
      public_id: record.user.publicId,
      display_name_public: record.user.displayNamePublic,
      avatar_url: record.user.avatarUrl,
    },
    image_url: imageUrl,
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

async function acceptedFriendIds(userId: string): Promise<Set<string>> {
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
}

function storageKeyFromUrl(imageUrl: string): string | null {
  const prefix = '/api/v1/lockets/media/';
  return imageUrl.startsWith(prefix) ? imageUrl.slice(prefix.length) : null;
}

class LocketsService {
  constructor(private readonly storage: LocketStorageAdapter = locketStorage) {}

  async getFeed(userId: string, type: 'ALL' | 'MINE' | 'FRIENDS' | 'DISCOVER') {
    const friendIds = await acceptedFriendIds(userId);
    let accessWhere: Prisma.LocketWhereInput;

    if (type === 'MINE') {
      accessWhere = { userId };
    } else if (type === 'DISCOVER') {
      accessWhere = { visibility: LocketVisibility.PUBLIC };
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

    const records = await prisma.locket.findMany({
      where: { deletedAt: null, AND: [accessWhere] },
      include: locketInclude,
      orderBy: [{ capturedAt: 'desc' }, { id: 'desc' }],
      take: 50,
    });
    return records.map((record) => serializeLocket(record, userId));
  }

  async getById(id: string, viewerId?: string): Promise<LocketRecord> {
    const record = await prisma.locket.findFirst({
      where: { id, deletedAt: null },
      include: locketInclude,
    });
    if (!record) throw new LocketApiError('LOCKET_NOT_FOUND', 'Không tìm thấy locket.', 404);

    const friendIds = viewerId ? await acceptedFriendIds(viewerId) : new Set<string>();
    if (!canViewLocket(record, viewerId, friendIds)) {
      throw new LocketApiError('LOCKET_FORBIDDEN', 'Bạn không có quyền xem locket này.', 403);
    }
    return record;
  }

  async create(userId: string, input: CreateLocketData, file: Express.Multer.File): Promise<LocketRecord> {
    const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null }, select: { id: true } });
    if (!user) throw new LocketApiError('AUTH_USER_NOT_FOUND', 'Không tìm thấy tài khoản.', 401);

    if (input.restaurantId) {
      const restaurant = await prisma.restaurant.findFirst({
        where: { id: input.restaurantId, deletedAt: null },
        select: { id: true },
      });
      if (!restaurant) throw new LocketApiError('RESTAURANT_NOT_FOUND', 'Không tìm thấy nhà hàng.', 404);
    }

    const stored = await this.storage.upload({ buffer: file.buffer, mimeType: file.mimetype });
    try {
      return await prisma.locket.create({
        data: {
          userId,
          restaurantId: input.restaurantId,
          imageUrl: stored.imageUrl,
          dishName: input.dishName,
          restaurantName: input.restaurantName,
          note: input.note,
          rating: input.rating,
          tags: input.tags,
          deviceHash: input.deviceHash,
          capturedAt: input.capturedAt,
          exifStripped: stored.exifStripped,
          lat: input.latitude,
          lng: input.longitude,
          visibility: input.visibility,
        },
        include: locketInclude,
      });
    } catch (error) {
      await this.storage.remove(stored.key);
      throw error;
    }
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

  async delete(id: string, userId: string): Promise<void> {
    const existing = await prisma.locket.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new LocketApiError('LOCKET_NOT_FOUND', 'Không tìm thấy locket.', 404);
    if (existing.userId !== userId) throw new LocketApiError('LOCKET_FORBIDDEN', 'Bạn không thể xóa locket này.', 403);

    await prisma.locket.update({ where: { id }, data: { deletedAt: new Date() } });
    const key = storageKeyFromUrl(existing.imageUrl);
    if (key) await this.storage.remove(key);
  }

  async getMedia(key: string, viewerId?: string, hasValidSignature = false) {
    if (!/^[a-f0-9-]{36}\.(jpg|png)$/.test(key)) {
      throw new LocketApiError('LOCKET_NOT_FOUND', 'Không tìm thấy ảnh.', 404);
    }
    const record = await prisma.locket.findFirst({
      where: { imageUrl: `/api/v1/lockets/media/${key}`, deletedAt: null },
      select: { userId: true, visibility: true },
    });
    if (!record) throw new LocketApiError('LOCKET_NOT_FOUND', 'Không tìm thấy ảnh.', 404);

    const friendIds = viewerId ? await acceptedFriendIds(viewerId) : new Set<string>();
    if (!hasValidSignature && !canViewLocket(record, viewerId, friendIds)) {
      throw new LocketApiError('LOCKET_FORBIDDEN', 'Bạn không có quyền xem ảnh này.', 403);
    }
    const media = await this.storage.read(key);
    if (!media) throw new LocketApiError('LOCKET_MEDIA_GONE', 'Ảnh dev đã hết hiệu lực. Bạn đăng lại locket nhé.', 410);
    return media;
  }

  async getPublicForUser(userId: string) {
    const records = await prisma.locket.findMany({
      where: { userId, visibility: LocketVisibility.PUBLIC, deletedAt: null },
      include: locketInclude,
      orderBy: [{ capturedAt: 'desc' }, { id: 'desc' }],
      take: 50,
    });
    return records.map((record) => serializeLocket(record));
  }
}

export const locketsService = new LocketsService();
export { LocketsService };
