import type { LocketRepository } from './repository';
import type { CreateLocketInput, Locket, LocketFeedFilter, UpdateLocketInput } from './types';

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
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
];

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
    if (!locket) throw new Error('Không tìm thấy locket.');
    return { ...locket };
  }

  async create(input: CreateLocketInput): Promise<Locket> {
    if (!/^[a-f0-9]{64}$/.test(input.deviceHash)) {
      throw new Error('Định danh thiết bị không hợp lệ.');
    }
    if (!input.localImageUri || !['image/jpeg', 'image/png', 'image/webp'].includes(input.mimeType)) {
      throw new Error('Ảnh locket không hợp lệ.');
    }
    if (!input.dishName.trim() || input.dishName.trim().length > 80) {
      throw new Error('Tên món phải có từ 1 đến 80 ký tự.');
    }
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      throw new Error('Rating phải từ 1 đến 5.');
    }
    if ((input.note?.length ?? 0) > 280) {
      throw new Error('Note tối đa 280 ký tự.');
    }
    const normalizedTags = input.tags.map((tag) => tag.trim()).filter(Boolean);
    if (
      normalizedTags.length > 5
      || normalizedTags.some((tag) => tag.length > 24)
      || new Set(normalizedTags.map((tag) => tag.toLocaleLowerCase('vi'))).size !== normalizedTags.length
    ) {
      throw new Error('Tags không hợp lệ hoặc bị trùng.');
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
      dishName: input.dishName.trim(),
      restaurantName: input.restaurantName?.trim(),
      note: input.note?.trim(),
      rating: input.rating,
      tags: normalizedTags,
      visibility: input.visibility,
      capturedAt: input.capturedAt,
      location: input.location,
      canDisplayLocation: false,
      createdAt: new Date().toISOString(),
    };
    lockets = [locket, ...lockets];
    return { ...locket };
  }

  async update(id: string, input: UpdateLocketInput): Promise<Locket> {
    const index = lockets.findIndex((item) => item.id === id);
    if (index < 0) throw new Error('Không tìm thấy locket.');
    if (lockets[index].ownerId !== CURRENT_USER_ID) throw new Error('Bạn không thể sửa locket này.');
    lockets[index] = { ...lockets[index], ...input };
    return { ...lockets[index] };
  }

  async delete(id: string): Promise<void> {
    const locket = lockets.find((item) => item.id === id);
    if (!locket) throw new Error('Không tìm thấy locket.');
    if (locket.ownerId !== CURRENT_USER_ID) throw new Error('Bạn không thể xóa locket này.');
    lockets = lockets.filter((item) => item.id !== id);
  }
}

export const locketRepository: LocketRepository = new MockLocketRepository();
