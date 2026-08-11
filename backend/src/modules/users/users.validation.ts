import { UserApiError } from './users.errors.js';

export interface UpdateProfileData {
  bio?: string | null;
  displayNamePrivate?: string;
  displayNamePublic?: string;
}

function displayName(value: unknown, label: string): string {
  if (typeof value !== 'string') throw new UserApiError('PROFILE_VALIDATION', `${label} không hợp lệ.`);
  const normalized = value.trim();
  if (normalized.length < 2 || normalized.length > 50) {
    throw new UserApiError('PROFILE_VALIDATION', `${label} phải có từ 2 đến 50 ký tự.`);
  }
  return normalized;
}

export function parseUpdateProfile(body: Record<string, unknown>): UpdateProfileData {
  const update: UpdateProfileData = {};
  if ('display_name_private' in body) update.displayNamePrivate = displayName(body.display_name_private, 'Tên trong nhóm');
  if ('display_name_public' in body) update.displayNamePublic = displayName(body.display_name_public, 'Tên công khai');
  if ('bio' in body) {
    if (body.bio === null || body.bio === '') update.bio = null;
    else if (typeof body.bio !== 'string') throw new UserApiError('PROFILE_VALIDATION', 'Bio không hợp lệ.');
    else {
      const bio = body.bio.trim();
      if (bio.length > 160) throw new UserApiError('PROFILE_VALIDATION', 'Bio tối đa 160 ký tự.');
      update.bio = bio || null;
    }
  }
  if ('public_id' in body) {
    throw new UserApiError('PROFILE_PUBLIC_ID_IMMUTABLE', 'Public ID không thể thay đổi.');
  }
  if ('avatar' in body || 'avatar_uri' in body) {
    throw new UserApiError('PROFILE_STORAGE_PENDING', 'Đổi avatar đang chờ cấu hình Supabase Storage.', 503);
  }
  if (Object.keys(update).length === 0) throw new UserApiError('PROFILE_VALIDATION', 'Không có dữ liệu để cập nhật.');
  return update;
}

export function validatePublicId(value: string | string[] | undefined): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{2,20}$/.test(value)) {
    throw new UserApiError('PROFILE_NOT_FOUND', 'Không tìm thấy profile.', 404);
  }
  return value;
}
