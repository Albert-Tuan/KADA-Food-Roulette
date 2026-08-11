import type { Locket } from '@/features/lockets';

export interface ProfileStats {
  locketCount: number;
  checkInCount: number;
  groupCount: number;
}

export interface PublicProfile {
  id: string;
  publicId: string;
  displayNamePublic: string;
  avatarUrl?: string;
  bio?: string;
  stats: ProfileStats;
  publicLockets: Locket[];
}

export interface PrivateProfile extends PublicProfile {
  displayNamePrivate: string;
  email: string;
}

export interface UpdateProfileInput {
  avatarUri?: string;
  bio?: string;
  displayNamePrivate?: string;
  displayNamePublic?: string;
}
