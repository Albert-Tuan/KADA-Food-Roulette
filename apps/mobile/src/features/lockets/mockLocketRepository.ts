import type { LocketRepository } from './repository';
import type { CreateLocketInput, Locket, LocketFeedFilter, UpdateLocketInput } from './types';
import { LOCKET_TIMESTAMP_TOLERANCE_SECONDS, MAX_CAPTION_LENGTH } from '../../lib/constants';

export const CURRENT_USER_ID = 'current-user';

let lockets: Locket[] = [
  {
    id: 'locket-1',
    ownerId: 'friend-1',
    author: {
      id: 'friend-1',
      publicId: 'minh-an',
      displayNamePublic: 'Minh An',
      avatarUrl: 'https://i.pravatar.cc/160?img=47',
    },
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
    dishName: 'Bún bò Huế',
    restaurantName: 'Bếp Huế Mộc',
    note: 'Nước dùng đậm vị, rau tươi và phần ăn vừa đủ.',
    rating: 5,
    tags: ['cay nhẹ', 'món Việt'],
    visibility: 'FRIENDS',
    capturedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    location: { latitude: 10.7769, longitude: 106.7009 },
    canDisplayLocation: false,
    permissions: { canDelete: false, canEdit: false },
    createdAt: new Date(Date.now() - 44 * 60 * 1000).toISOString(),
  },
  {
    id: 'locket-2',
    ownerId: CURRENT_USER_ID,
    author: {
      id: CURRENT_USER_ID,
      publicId: 'gia-binh-food',
      displayNamePublic: 'Bình Ăn Gì',
      avatarUrl: 'https://i.pravatar.cc/160?img=12',
    },
    imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=900&q=80',
    dishName: 'Cơm tấm sườn',
    restaurantName: 'Cơm Tấm Nhà Mình',
    note: 'Sườn mềm, cơm nóng. Mình sẽ ghé lại.',
    rating: 4,
    tags: ['cơm', 'bình dân'],
    visibility: 'PUBLIC',
    capturedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    location: { latitude: 10.7626, longitude: 106.6822 },
    canDisplayLocation: false,
    permissions: { canDelete: true, canEdit: true },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'locket-3',
    ownerId: 'discover-1',
    author: {
      id: 'discover-1',
      publicId: 'lan-chi',
      displayNamePublic: 'Lan Chi',
      avatarUrl: 'https://i.pravatar.cc/160?img=32',
    },
    imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=900&q=80',
    dishName: 'Mì xào hải sản',
    restaurantName: 'Góc Bếp Nhỏ',
    note: 'Hải sản tươi, mì không bị dầu.',
    rating: 4,
    tags: ['hải sản', 'mì'],
    visibility: 'PUBLIC',
    capturedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    canDisplayLocation: false,
    permissions: { canDelete: false, canEdit: false },
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'locket-private',
    ownerId: CURRENT_USER_ID,
    author: {
      id: CURRENT_USER_ID,
      publicId: 'gia-binh-food',
      displayNamePublic: 'Bình Ăn Gì',
      avatarUrl: 'https://i.pravatar.cc/160?img=12',
    },
    imageUrl: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=900&q=80',
    dishName: 'Bánh mì chảo',
    note: 'Bữa sáng mình muốn giữ riêng.',
    rating: 4,
    tags: ['bữa sáng'],
    visibility: 'PRIVATE',
    capturedAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
    canDisplayLocation: false,
    permissions: { canDelete: true, canEdit: true },
    createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
  },
];

function validateLocketInput(input: CreateLocketInput): void {
  const capturedAt = new Date(input.capturedAt).getTime();
  const timestampDelta = Math.abs(Date.now() - capturedAt);

  if (!/^[a-f0-9]{64}$/.test(input.deviceHash)) throw new Error('Định danh thiết bị không hợp lệ.');
  if (!input.localImageUri || !['image/jpeg', 'image/png', 'image/webp'].includes(input.mimeType)) {
    throw new Error('Ảnh Taste Board không hợp lệ.');
  }
  if ((input.note?.length ?? 0) > MAX_CAPTION_LENGTH) {
    throw new Error(`Note tối đa ${MAX_CAPTION_LENGTH} ký tự.`);
  }
  if (!['PRIVATE', 'FRIENDS', 'PUBLIC'].includes(input.visibility)) {
    throw new Error('Quyền hiển thị không hợp lệ.');
  }
  if (!Number.isFinite(capturedAt) || timestampDelta > LOCKET_TIMESTAMP_TOLERANCE_SECONDS * 1000) {
    throw new Error('Ảnh đã quá thời gian xác nhận. Bạn chụp lại nhé.');
  }
  if (
    !Number.isFinite(input.location.latitude)
    || input.location.latitude < -90
    || input.location.latitude > 90
    || !Number.isFinite(input.location.longitude)
    || input.location.longitude < -180
    || input.location.longitude > 180
  ) {
    throw new Error('Vị trí không hợp lệ.');
  }

}

function sortChronologically(items: Locket[]): Locket[] {
  return [...items].sort(
    (first, second) => new Date(second.capturedAt).getTime() - new Date(first.capturedAt).getTime(),
  );
}

class MockLocketRepository implements LocketRepository {
  async getFeed(filter: LocketFeedFilter = 'ALL'): Promise<Locket[]> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const visible = lockets.filter((locket) => {
      if (filter === 'MINE') return locket.ownerId === CURRENT_USER_ID;
      if (filter === 'FRIENDS') return locket.ownerId !== CURRENT_USER_ID && locket.visibility === 'FRIENDS';
      if (filter === 'DISCOVER') return locket.visibility === 'PUBLIC';
      return locket.ownerId === CURRENT_USER_ID || locket.visibility !== 'PRIVATE';
    });
    return sortChronologically(visible);
  }

  async getById(id: string): Promise<Locket> {
    const locket = lockets.find((item) => item.id === id);
    if (!locket) throw new Error('Không tìm thấy Taste Board.');
    return { ...locket };
  }

  async create(input: CreateLocketInput): Promise<Locket> {
    validateLocketInput(input);
    const locket: Locket = {
      id: `local-${Date.now()}`,
      ownerId: CURRENT_USER_ID,
      author: {
        id: CURRENT_USER_ID,
        publicId: 'gia-binh-food',
        displayNamePublic: 'Bình Ăn Gì',
        avatarUrl: 'https://i.pravatar.cc/160?img=12',
      },
      imageUrl: input.localImageUri,
      restaurantId: input.restaurantId,
      note: input.note?.trim(),
      visibility: input.visibility,
      capturedAt: input.capturedAt,
      location: input.location,
      canDisplayLocation: false,
      permissions: { canDelete: true, canEdit: true },
      createdAt: new Date().toISOString(),
    };
    lockets = [locket, ...lockets];
    return { ...locket };
  }

  async update(id: string, input: UpdateLocketInput): Promise<Locket> {
    const index = lockets.findIndex((item) => item.id === id);
    if (index < 0) throw new Error('Không tìm thấy Taste Board.');
    if (lockets[index].ownerId !== CURRENT_USER_ID) throw new Error('Bạn không thể sửa Taste Board này.');
    lockets[index] = {
      ...lockets[index],
      ...(input.dishName !== undefined ? { dishName: input.dishName } : {}),
      ...(input.restaurantId !== undefined ? { restaurantId: input.restaurantId ?? undefined } : {}),
      ...(input.restaurantName !== undefined ? { restaurantName: input.restaurantName ?? undefined } : {}),
      ...(input.note !== undefined ? { note: input.note ?? undefined } : {}),
      ...(input.rating !== undefined ? { rating: input.rating ?? 0 } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
    };
    return { ...lockets[index] };
  }

  async delete(id: string): Promise<void> {
    const locket = lockets.find((item) => item.id === id);
    if (!locket) throw new Error('Không tìm thấy Taste Board.');
    if (locket.ownerId !== CURRENT_USER_ID) throw new Error('Bạn không thể xóa Taste Board này.');
    lockets = lockets.filter((item) => item.id !== id);
  }
}

export const mockLocketRepository: LocketRepository = new MockLocketRepository();
