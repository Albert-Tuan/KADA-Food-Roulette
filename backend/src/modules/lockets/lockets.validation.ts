import { LocketVisibility } from '@prisma/client';
import { LocketApiError } from './lockets.errors.js';

export const MAX_LOCKET_FILE_SIZE = 10 * 1024 * 1024;
export const LOCKET_TIMESTAMP_TOLERANCE_MS = 60_000;
export const ALLOWED_LOCKET_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

export interface CreateLocketData {
  restaurantId?: string;
  restaurantName?: string;
  dishName?: string;
  note?: string;
  rating?: number;
  tags?: string[];
  visibility: LocketVisibility;
  latitude: number;
  longitude: number;
  capturedAt: Date;
  deviceHash: string;
}

export interface UpdateLocketData {
  restaurantId?: string | null;
  restaurantName?: string | null;
  dishName?: string;
  note?: string | null;
  rating?: number | null;
  tags?: string[];
  visibility?: LocketVisibility;
}

function optionalText(value: unknown, maxLength: number, fieldLabel: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') throw new LocketApiError('LOCKET_VALIDATION', `${fieldLabel} không hợp lệ.`);
  const normalized = value.trim();
  if (!normalized) return undefined;
  if (normalized.length > maxLength) {
    throw new LocketApiError('LOCKET_VALIDATION', `${fieldLabel} tối đa ${maxLength} ký tự.`);
  }
  return normalized;
}

function requiredText(value: unknown, maxLength: number, fieldLabel: string): string {
  const normalized = optionalText(value, maxLength, fieldLabel);
  if (!normalized) throw new LocketApiError('LOCKET_VALIDATION', `${fieldLabel} là bắt buộc.`);
  return normalized;
}

function parseRating(value: unknown, required: boolean): number | undefined {
  if ((value === undefined || value === null || value === '') && !required) return undefined;
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new LocketApiError('LOCKET_VALIDATION', 'Rating phải là số nguyên từ 1 đến 5.');
  }
  return rating;
}

function parseTags(value: unknown): string[] {
  let rawTags: unknown = value;
  if (typeof value === 'string') {
    try {
      rawTags = JSON.parse(value);
    } catch {
      throw new LocketApiError('LOCKET_VALIDATION', 'Tags phải là một mảng JSON hợp lệ.');
    }
  }
  if (!Array.isArray(rawTags)) throw new LocketApiError('LOCKET_VALIDATION', 'Tags phải là một mảng.');

  const tags = rawTags.map((tag) => {
    if (typeof tag !== 'string') throw new LocketApiError('LOCKET_VALIDATION', 'Tag không hợp lệ.');
    return tag.trim().replace(/^#/, '');
  }).filter(Boolean);

  if (tags.length > 5 || tags.some((tag) => tag.length > 24)) {
    throw new LocketApiError('LOCKET_VALIDATION', 'Tối đa 5 tags, mỗi tag không quá 24 ký tự.');
  }
  if (new Set(tags.map((tag) => tag.toLocaleLowerCase('vi'))).size !== tags.length) {
    throw new LocketApiError('LOCKET_VALIDATION', 'Tags không được trùng nhau.');
  }
  return tags;
}

function parseVisibility(value: unknown, fallback?: LocketVisibility): LocketVisibility | undefined {
  if ((value === undefined || value === null || value === '') && fallback) return fallback;
  if (value === 'PRIVATE' || value === 'FRIENDS' || value === 'PUBLIC') return value;
  throw new LocketApiError('LOCKET_VALIDATION', 'Quyền hiển thị không hợp lệ.');
}

function parseCoordinate(value: unknown, min: number, max: number, label: string): number {
  const coordinate = Number(value);
  if (!Number.isFinite(coordinate) || coordinate < min || coordinate > max) {
    throw new LocketApiError('LOCKET_VALIDATION', `${label} không hợp lệ.`);
  }
  return coordinate;
}

export function validateImageFile(file?: Express.Multer.File): asserts file is Express.Multer.File {
  if (!file) throw new LocketApiError('LOCKET_IMAGE_REQUIRED', 'Bạn cần chụp ảnh trước khi đăng.');
  if (!ALLOWED_LOCKET_MIME_TYPES.has(file.mimetype) || file.size > MAX_LOCKET_FILE_SIZE) {
    throw new LocketApiError('LOCKET_IMAGE_INVALID', 'Ảnh phải là JPEG/PNG và không quá 10 MB.');
  }

  const isJpeg = file.buffer.length >= 3
    && file.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer[2] === 0xff;
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const isPng = file.buffer.length >= pngSignature.length
    && pngSignature.every((byte, index) => file.buffer[index] === byte);

  if ((file.mimetype === 'image/jpeg' && !isJpeg) || (file.mimetype === 'image/png' && !isPng)) {
    throw new LocketApiError('LOCKET_IMAGE_INVALID', 'Nội dung ảnh không khớp định dạng đã khai báo.');
  }
}

export function parseCreateLocket(
  body: Record<string, unknown>,
  headers: { deviceHash?: string; capturedAt?: string },
  now = new Date(),
): CreateLocketData {
  let deviceHash = headers.deviceHash?.trim();
  if (!deviceHash || !/^[a-f0-9]{64}$/.test(deviceHash)) {
    if (process.env.NODE_ENV !== 'production') {
      deviceHash = 'a'.repeat(64);
    } else {
      throw new LocketApiError('LOCKET_DEVICE_INVALID', 'Định danh cài đặt không hợp lệ.', 403);
    }
  }

  const capturedAt = new Date(headers.capturedAt ?? '');
  const tolerance = process.env.NODE_ENV === 'development' ? 10 * 60_000 : LOCKET_TIMESTAMP_TOLERANCE_MS;
  if (!Number.isFinite(capturedAt.getTime()) || Math.abs(now.getTime() - capturedAt.getTime()) > tolerance) {
    throw new LocketApiError('LOCKET_CAPTURE_EXPIRED', 'Thời điểm chụp không hợp lệ hoặc đã quá thời gian cho phép.');
  }

  return {
    restaurantId: optionalText(body.restaurant_id, 36, 'Mã nhà hàng'),
    restaurantName: optionalText(body.restaurant_name, 120, 'Tên nhà hàng'),
    dishName: optionalText(body.dish_name, 80, 'Tên món'),
    note: optionalText(body.note, 280, 'Note'),
    rating: parseRating(body.rating, false),
    tags: body.tags === undefined ? undefined : parseTags(body.tags),
    visibility: parseVisibility(body.visibility, LocketVisibility.FRIENDS)!,
    latitude: parseCoordinate(body.latitude, -90, 90, 'Latitude'),
    longitude: parseCoordinate(body.longitude, -180, 180, 'Longitude'),
    capturedAt,
    deviceHash,
  };
}

export function parseUpdateLocket(body: Record<string, unknown>): UpdateLocketData {
  const update: UpdateLocketData = {};
  if ('restaurant_id' in body) update.restaurantId = body.restaurant_id === null ? null : optionalText(body.restaurant_id, 36, 'Mã nhà hàng') ?? null;
  if ('restaurant_name' in body) update.restaurantName = body.restaurant_name === null ? null : optionalText(body.restaurant_name, 120, 'Tên nhà hàng') ?? null;
  if ('dish_name' in body) update.dishName = requiredText(body.dish_name, 80, 'Tên món');
  if ('note' in body) update.note = body.note === null ? null : optionalText(body.note, 280, 'Note') ?? null;
  if ('rating' in body) update.rating = body.rating === null ? null : parseRating(body.rating, true)!;
  if ('tags' in body) update.tags = parseTags(body.tags);
  if ('visibility' in body) update.visibility = parseVisibility(body.visibility)!;
  if (Object.keys(update).length === 0) throw new LocketApiError('LOCKET_VALIDATION', 'Không có dữ liệu để cập nhật.');
  return update;
}

export function parseFeedType(value: unknown): 'ALL' | 'MINE' | 'FRIENDS' | 'DISCOVER' {
  const normalized = typeof value === 'string' ? value.toUpperCase() : 'ALL';
  if (normalized === 'ALL' || normalized === 'MINE' || normalized === 'FRIENDS' || normalized === 'DISCOVER') return normalized;
  throw new LocketApiError('LOCKET_VALIDATION', 'Bộ lọc feed không hợp lệ.');
}

export function parseRouteParam(value: string | string[] | undefined, label: string): string {
  if (typeof value !== 'string' || !value) {
    throw new LocketApiError('LOCKET_VALIDATION', `${label} không hợp lệ.`);
  }
  return value;
}
