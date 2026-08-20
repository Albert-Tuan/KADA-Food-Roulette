import { test, expect } from '@jest/globals';
import type { LocketDto } from '../../api/endpoints/lockets';
import { API_URL } from '../../lib/constants';
import { mapLocketDto } from './locketMapper';

function locketDto(): LocketDto {
  return {
    id: 'locket-1',
    owner_id: 'user-1',
    author: { id: 'user-1', public_id: 'binh', display_name_public: 'Bình' },
    image_url: '/api/v1/lockets/media/image.jpg',
    dish_name: 'Bún bò Huế',
    restaurant_id: 'restaurant-1',
    rating: 5,
    tags: ['món Việt'],
    like_count: 0,
    is_liked: false,
    visibility: 'PUBLIC',
    captured_at: '2026-08-09T09:00:00.000Z',
    can_display_location: false,
    exif_stripped: false,
    permissions: { can_edit: true, can_delete: true },
    created_at: '2026-08-09T09:00:01.000Z',
    updated_at: '2026-08-09T09:00:01.000Z',
  };
}

test('maps API Locket DTO into the repository domain model', () => {
  const mapped = mapLocketDto(locketDto());
  const apiOrigin = API_URL.replace(/\/api\/v1\/?$/, '');
  expect(mapped.imageUrl).toBe(`${apiOrigin}/api/v1/lockets/media/image.jpg`);
  expect(mapped.permissions).toEqual({ canEdit: true, canDelete: true });
  expect(mapped.restaurantId).toBe('restaurant-1');
  expect(mapped.likeCount).toBe(0);
  expect(mapped.isLiked).toBe(false);
  expect(mapped.location).toBeUndefined();
});
