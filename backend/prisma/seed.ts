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
    id: '11111111-1111-4111-8111-111111111111',
    email: 'test@foodroulette.app',
    displayNamePrivate: 'Tài khoản kiểm thử',
    displayNamePublic: 'Food Roulette Tester',
    publicId: 'demo_tester',
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
  });

  console.info('Seed hoàn tất.');
  console.info(`Đăng nhập demo: ${demoUsers[0].email} / ${DEMO_PASSWORD}`);
  console.info(`Tài khoản bạn bè: ${demoUsers[1].email} / ${DEMO_PASSWORD}`);
}

seed()
  .catch((error: unknown) => {
    console.error('Seed thất bại:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
