import type { LocketDto } from '../../api/endpoints/lockets';
import { API_URL } from '../../lib/constants';
import type { Locket } from './types';

function absoluteMediaUrl(imageUrl: string): string {
  if (!imageUrl.startsWith('/')) return imageUrl;
  const apiOrigin = API_URL.replace(/\/api\/v1\/?$/, '');
  return `${apiOrigin}${imageUrl}`;
}

export function mapLocketDto(dto: LocketDto): Locket {
  return {
    id: dto.id,
    ownerId: dto.owner_id,
    author: {
      id: dto.author.id,
      publicId: dto.author.public_id,
      displayNamePublic: dto.author.display_name_public,
      avatarUrl: dto.author.avatar_url ?? undefined,
    },
    imageUrl: absoluteMediaUrl(dto.image_url),
    dishName: dto.dish_name ?? undefined,
    restaurantId: dto.restaurant_id ?? undefined,
    restaurantName: dto.restaurant_name ?? undefined,
    note: dto.note ?? undefined,
    rating: dto.rating ?? undefined,
    tags: dto.tags ?? [],
    likeCount: dto.like_count,
    isLiked: dto.is_liked,
    visibility: dto.visibility,
    capturedAt: dto.captured_at,
    location: dto.location ?? undefined,
    canDisplayLocation: dto.can_display_location,
    permissions: {
      canEdit: dto.permissions.can_edit,
      canDelete: dto.permissions.can_delete,
    },
    createdAt: dto.created_at,
  };
}
