import { getApiErrorMessage, usersApi } from '@/api';
import { mapPrivateProfile, mapPublicProfile } from './profileMapper';
import type { ProfileRepository } from './repository';
import type { PrivateProfile, PublicProfile, UpdateProfileInput } from './types';

class ApiProfileRepository implements ProfileRepository {
  async getPublicProfile(publicId: string): Promise<PublicProfile> {
    try {
      return mapPublicProfile(await usersApi.getPublic(publicId));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Không tìm thấy profile.'));
    }
  }

  async getMyProfile(): Promise<PrivateProfile> {
    try {
      return mapPrivateProfile(await usersApi.getMe());
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Chưa tải được profile.'));
    }
  }

  async updateProfile(input: UpdateProfileInput): Promise<PrivateProfile> {
    if (input.avatarUri && !/^https?:\/\//.test(input.avatarUri)) {
      throw new Error('Đổi avatar đang chờ cấu hình Supabase Storage.');
    }
    try {
      return mapPrivateProfile(await usersApi.updateMe({
        bio: input.bio?.trim() || null,
        display_name_private: input.displayNamePrivate?.trim(),
        display_name_public: input.displayNamePublic?.trim(),
      }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Chưa lưu được profile.'));
    }
  }
}

export const apiProfileRepository: ProfileRepository = new ApiProfileRepository();
