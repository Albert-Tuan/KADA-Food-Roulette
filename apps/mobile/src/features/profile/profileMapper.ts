import type { PrivateProfileDto, PublicProfileDto } from '../../api/endpoints/users';
import { mapLocketDto } from '../lockets/locketMapper';
import type { PrivateProfile, PublicProfile } from './types';

export function mapPublicProfile(dto: PublicProfileDto): PublicProfile {
  return {
    id: dto.id,
    publicId: dto.public_id,
    displayNamePublic: dto.display_name_public,
    avatarUrl: dto.avatar_url ?? undefined,
    bio: dto.bio ?? undefined,
    stats: {
      locketCount: dto.stats.locket_count,
      checkInCount: dto.stats.check_in_count,
      groupCount: dto.stats.group_count,
    },
    publicLockets: dto.public_lockets.map(mapLocketDto),
  };
}

export function mapPrivateProfile(dto: PrivateProfileDto): PrivateProfile {
  return {
    ...mapPublicProfile(dto),
    email: dto.email,
    displayNamePrivate: dto.display_name_private,
  };
}
