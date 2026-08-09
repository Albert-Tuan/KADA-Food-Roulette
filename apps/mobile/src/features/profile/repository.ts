import type { PrivateProfile, PublicProfile, UpdateProfileInput } from './types';

export interface ProfileRepository {
  getPublicProfile(publicId: string): Promise<PublicProfile>;
  getMyProfile(): Promise<PrivateProfile>;
  updateProfile(input: UpdateProfileInput): Promise<PrivateProfile>;
}
