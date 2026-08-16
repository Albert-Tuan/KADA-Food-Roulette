import type { PublicProfileDto } from '../../api/endpoints/users';
import { mapPublicProfile } from './profileMapper';

test('public profile mapping never exposes private display name or email', () => {
  const dto = {
    id: 'user-1',
    public_id: 'binh',
    display_name_public: 'Bình Ăn Gì',
    display_name_private: 'Tên riêng',
    email: 'private@example.com',
    stats: { locket_count: 0, check_in_count: 0, group_count: 0 },
    public_lockets: [],
    created_at: '2026-08-09T09:00:00.000Z',
  } as PublicProfileDto & { display_name_private: string; email: string };

  const mapped = mapPublicProfile(dto);
  expect(mapped.displayNamePublic).toBe('Bình Ăn Gì');
  expect('displayNamePrivate' in mapped).toBe(false);
  expect('email' in mapped).toBe(false);
});
