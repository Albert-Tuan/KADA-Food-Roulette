import 'dotenv/config';

import {
  FriendshipStatus,
  PrismaClient,
  RestaurantSource,
  RestaurantStatus,
  SubTier,
  UserRole,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'password123';

const demoUsers = [
  {
    id: '33333333-3333-4333-8333-333333333333',
    email: 'locket-test@foodroulette.app',
    displayNamePrivate: 'Tài khoản kiểm thử',
    displayNamePublic: 'Food Roulette Tester',
    publicId: 'locket_tester',
    subscriptionTier: SubTier.PREMIUM,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'friend@foodroulette.app',
    displayNamePrivate: 'Bạn bè kiểm thử',
    displayNamePublic: 'Demo Friend',
    publicId: 'demo_friend',
    subscriptionTier: SubTier.FREE,
  },
] as const;

const demoRestaurants = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Phở Hòa Pasteur',
    address: '260C Pasteur, Quận 3, TP.HCM',
    lat: 10.786,
    lng: 106.691,
    category: 'Phở',
    priceLevel: 2,
    rating: 4.5,
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    name: 'Cơm tấm Sài Gòn',
    address: '109 Nguyễn Trãi, Quận 1, TP.HCM',
    lat: 10.769,
    lng: 106.693,
    category: 'Cơm tấm',
    priceLevel: 1,
    rating: 4.7,
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    name: 'Bánh mì Huỳnh Thúc',
    address: '57 Nguyễn Văn Cừ, Quận 5, TP.HCM',
    lat: 10.762,
    lng: 106.682,
    category: 'Bánh mì',
    priceLevel: 1,
    rating: 4.8,
  },
] as const;

const MOCK_MAN_THIEN_RESTAURANTS = [
  {
    name: 'Bún Bò Huế Ngọc Dung',
    address: '143 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8468,
    lng: 106.7942,
    phone: '0901234567',
    source: RestaurantSource.USER_SUBMITTED,
    status: RestaurantStatus.APPROVED,
    rating: 4.6,
    category: 'Bún Bò',
    priceLevel: 2,
  },
  {
    name: 'Lẩu Bò Nghĩa Phát',
    address: '200 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8459,
    lng: 106.7951,
    phone: '0912345678',
    source: RestaurantSource.GOOGLE_PLACES,
    status: RestaurantStatus.APPROVED,
    rating: 4.3,
    category: 'Lẩu',
    priceLevel: 3,
  },
  {
    name: 'Bánh Tráng Nướng Dì Lan',
    address: '95 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8475,
    lng: 106.7935,
    source: RestaurantSource.USER_SUBMITTED,
    status: RestaurantStatus.APPROVED,
    rating: 4.8,
    category: 'Ăn Vặt',
    priceLevel: 1,
  },
  {
    name: 'Cơm Tấm Đêm Man Thiện',
    address: '250 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8451,
    lng: 106.796,
    source: RestaurantSource.GOOGLE_PLACES,
    status: RestaurantStatus.APPROVED,
    rating: 4.1,
    category: 'Cơm Tấm',
    priceLevel: 2,
  },
  {
    name: 'Trà Sữa Mixue Man Thiện',
    address: '120 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8471,
    lng: 106.7939,
    phone: '0987654321',
    source: RestaurantSource.GOOGLE_PLACES,
    status: RestaurantStatus.APPROVED,
    rating: 4.5,
    category: 'Trà Sữa',
    priceLevel: 1,
  },
  {
    name: 'Gà Rán Jollibee',
    address: '190 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.846,
    lng: 106.7949,
    source: RestaurantSource.GOOGLE_PLACES,
    status: RestaurantStatus.APPROVED,
    rating: 4.2,
    category: 'Fast Food',
    priceLevel: 2,
  },
  {
    name: 'Phở Bắc Hải',
    address: '30 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8485,
    lng: 106.792,
    source: RestaurantSource.USER_SUBMITTED,
    status: RestaurantStatus.APPROVED,
    rating: 4.4,
    category: 'Phở',
    priceLevel: 2,
  },
  {
    name: 'Ốc Đêm Sinh Viên',
    address: 'Hẻm 140 Man Thiện, Tăng Nhơn Phú A, Quận 9',
    lat: 10.8469,
    lng: 106.7945,
    source: RestaurantSource.USER_SUBMITTED,
    status: RestaurantStatus.APPROVED,
    rating: 4.7,
    category: 'Hải Sản',
    priceLevel: 2,
  },
  {
    name: 'Bún Đậu Mắm Tôm A Chảnh',
    address: '165 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8464,
    lng: 106.7947,
    source: RestaurantSource.GOOGLE_PLACES,
    status: RestaurantStatus.APPROVED,
    rating: 4.0,
    category: 'Bún Đậu',
    priceLevel: 2,
  },
  {
    name: 'Mì Cay Sasin Man Thiện',
    address: '88 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8478,
    lng: 106.793,
    source: RestaurantSource.GOOGLE_PLACES,
    status: RestaurantStatus.APPROVED,
    rating: 4.3,
    category: 'Mì Cay',
    priceLevel: 2,
  },
] as const;

function assertSafeEnvironment(): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Từ chối seed dữ liệu demo trong môi trường production.');
  }
}

async function seed(): Promise<void> {
  assertSafeEnvironment();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.$transaction(async (tx) => {
    for (const user of demoUsers) {
      await tx.user.upsert({
        where: { email: user.email },
        update: {
          passwordHash,
          displayNamePrivate: user.displayNamePrivate,
          displayNamePublic: user.displayNamePublic,
          publicId: user.publicId,
          role: UserRole.USER,
          subscriptionTier: user.subscriptionTier,
          isOnboarded: true,
          deletedAt: null,
        },
        create: {
          ...user,
          passwordHash,
          role: UserRole.USER,
          isOnboarded: true,
        },
      });
    }

    const seededUsers = await tx.user.findMany({
      where: { email: { in: demoUsers.map(({ email }) => email) } },
      select: { id: true, email: true },
    });
    const userIdByEmail = new Map(seededUsers.map(({ id, email }) => [email, id]));
    const testerId = userIdByEmail.get(demoUsers[0].email);
    const friendId = userIdByEmail.get(demoUsers[1].email);

    if (!testerId || !friendId) {
      throw new Error('Không thể tạo đầy đủ tài khoản demo.');
    }

    for (const [userId, balance] of [
      [testerId, 50n],
      [friendId, 20n],
    ] as const) {
      await tx.spinWallet.upsert({
        where: { userId },
        update: { balance },
        create: { userId, balance },
      });

      await tx.userPreference.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });
    }

    await tx.friendship.upsert({
      where: {
        requesterId_addresseeId: {
          requesterId: testerId,
          addresseeId: friendId,
        },
      },
      update: { status: FriendshipStatus.ACCEPTED },
      create: {
        requesterId: testerId,
        addresseeId: friendId,
        status: FriendshipStatus.ACCEPTED,
      },
    });

    for (const restaurant of demoRestaurants) {
      const data = {
        ...restaurant,
        source: RestaurantSource.USER_SUBMITTED,
        status: RestaurantStatus.APPROVED,
        deletedAt: null,
      };

      await tx.restaurant.upsert({
        where: { id: restaurant.id },
        update: data,
        create: data,
      });
    }

    for (const restaurant of MOCK_MAN_THIEN_RESTAURANTS) {
      const existing = await tx.restaurant.findFirst({
        where: { name: restaurant.name, address: restaurant.address },
        select: { id: true },
      });

      if (!existing) {
        await tx.restaurant.create({ data: restaurant });
      }
    }
  });

  console.info('Seed hoàn tất.');
  console.info(`Đăng nhập demo: ${demoUsers[0].email} / ${DEMO_PASSWORD}`);
  console.info(`Tài khoản bạn bè: ${demoUsers[1].email} / ${DEMO_PASSWORD}`);
  console.info('Quán Man Thiện: 10 quán (bỏ qua nếu đã tồn tại).');
}

seed()
  .catch((error: unknown) => {
    console.error('Seed thất bại:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
