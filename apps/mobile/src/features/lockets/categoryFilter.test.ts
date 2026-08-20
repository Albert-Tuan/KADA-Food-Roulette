import { describe, expect, test } from '@jest/globals';
import {
  filterTasteBoardsByCategory,
  matchesTasteBoardCategory,
  type TasteBoardCategory,
} from './categoryFilter';
import type { Locket } from './types';

function locket(overrides: Partial<Locket>): Locket {
  return {
    id: 'locket-1',
    ownerId: 'user-1',
    author: {
      id: 'user-1',
      publicId: 'foodie',
      displayNamePublic: 'Foodie',
    },
    imageUrl: 'https://example.com/image.jpg',
    likeCount: 0,
    isLiked: false,
    visibility: 'PUBLIC',
    capturedAt: '2026-08-20T08:00:00.000Z',
    canDisplayLocation: false,
    permissions: { canDelete: false, canEdit: false },
    createdAt: '2026-08-20T08:00:00.000Z',
    ...overrides,
  };
}

describe('Taste Board category filters', () => {
  test('matches normalized Taste Board content', () => {
    const cases: [TasteBoardCategory, Locket][] = [
      ['pho', locket({ dishName: 'Phở bò tái' })],
      ['bun', locket({ note: 'Tô bún riêu rất vừa miệng' })],
      ['banhmi', locket({ tags: ['Bánh mì', 'bữa sáng'] })],
      ['cuon', locket({ restaurantName: 'Bánh Cuốn Tây Hồ' })],
    ];
    for (const [category, item] of cases) {
      expect(matchesTasteBoardCategory(item, category)).toBe(true);
    }
  });

  test('keeps Phở and Bún as separate filters', () => {
    const items = [
      locket({ id: 'pho', dishName: 'Phở gà' }),
      locket({ id: 'bun', dishName: 'Bún bò Huế' }),
    ];

    expect(filterTasteBoardsByCategory(items, 'pho').map((item) => item.id)).toEqual(['pho']);
    expect(filterTasteBoardsByCategory(items, 'bun').map((item) => item.id)).toEqual(['bun']);
  });
});
