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

// 89 quán ăn thực tế khu vực Man Thiện / Lê Văn Việt, Quận 9
const REAL_RESTAURANTS: Array<{
  name: string;
  address: string;
}> = [
  { name: 'Tiệm lẩu nhà An - Lẩu cá 69k', address: '464 Đ. Lê Văn Việt, Quận 9, TP. HCM.' },
  { name: 'KATSUYA - Vincom Lê Văn Việt', address: '50 Đ. Lê Văn Việt, Tăng Nhơn Phú, TP. HCM.' },
  { name: 'Tiệm cô Út', address: '591c Đ. Lê Văn Việt, Tăng Nhơn Phú, TP. HCM.' },
  { name: 'Gyu Shige - Ngưu Phồn Vincom Lê Văn Việt', address: '50 Đ. Lê Văn Việt, Tăng Nhơn Phú, TP. HCM.' },
  { name: 'Wallace Lê Văn Việt', address: '243 Đ. Lê Văn Việt, Tăng Nhơn Phú, TP. HCM.' },
  { name: 'Ốc Đêm Chú Đỉnh 3 - 158 Man Thiện', address: '158 Man Thiện, Tăng Nhơn Phú, TP. HCM.' },
  { name: 'Quán Man Thiện--cháo lòng,má heo', address: 'Đường 106 tổ 7 kp1 Phường Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Quán 3 Đời', address: '120B Man Thiện, Tăng Nhơn Phú, TP. HCM.' },
  { name: 'Lẩu Gà 3 Vị', address: '262A Man Thiện, Tăng Nhơn Phú, TP. HCM.' },
  { name: 'Tiệm người Quảng', address: '269 Man Thiện, Quận 9, TP. HCM.' },
  { name: 'Lẩu Gà Lá É Phú Yên', address: '174A Đ. Man Thiện, P. Tân Phú, Quận 9, TP. HCM.' },
  { name: 'Lẩu – Nướng 888', address: 'Đường Man Thiện, P. Tân Phú, Quận 9, TP. HCM.' },
  { name: 'Quán ăn Bình Dân Bờ Kè', address: '156 Đ. Man Thiện, P. Tân Phú, Quận 9, TP. HCM.' },
  { name: 'Lẩu bò 355', address: '355 Đ. Man Thiện, TP. Thủ Đức, TP. HCM.' },
  { name: 'BBQ NGON', address: '230 Đ. Man Thiện, P. Tân Phú, Quận 9, TP. HCM.' },
  { name: 'Quán Cơm Trang', address: '104 Đ. Man Thiện, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Quán Ốc Bum', address: '449 Đ. Man Thiện, P. Tân Phú, Quận 9, TP. HCM.' },
  { name: 'NOKANG - Nem nướng Nha Trang', address: '194 Đ. Man Thiện, P. Tân Phú, Quận 9, TP. HCM.' },
  { name: 'Bún Đậu Mắm Tôm H-Famil Man Thiện', address: '202A3 Man Thiện, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'ĂN VẶT NGỌC HÂN - Nước ép & Cá viên', address: '200A Man Thiện, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Lẩu Cá 69k - Chi nhánh Man Thiện', address: '200A Man Thiện, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Bún Đậu Mắm Tôm A Chảnh', address: '200 Man Thiện, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Tư Lửa - Bánh Canh Cá Lóc', address: '202 Man Thiện, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Quán Ốc Ngon', address: '120 Man Thiện, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Quán Chay Thiện Duyên', address: '9 Man Thiện, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'The Tea Hut', address: '11 Man Thiện, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Cơm Chiên, Hủ Tiếu Xào & Bún Bò', address: '67 Man Thiện, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Bánh Cuốn Nóng', address: '3 Man Thiện, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Kichi Kichi Lẩu Băng Chuyền', address: 'Tầng L4, Vincom Plaza, 50 Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Gyu-Kaku Japanese BBQ', address: 'Tầng L4, Vincom Plaza, 50 Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Nijyu Maru', address: 'Tầng L4, Vincom Plaza, 50 Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Manwah Taiwanese Hotpot', address: 'Tầng L4, Vincom Plaza, 50 Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Cánh Đồng Quán', address: '136/10 Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'G.D Beefsteak', address: '192 Lê Văn Việt, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Phương Chi - Bakery & Coffee', address: '424 Lê Văn Việt, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Việt Sushi', address: 'Vincom Plaza, 50 Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Bún Đậu Mắm Tôm H-Famil Lê Văn Việt', address: '136 Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Gỏi Vịt Xiêm', address: 'Đối diện ĐH Giao Thông Vận Tải Cơ Sở 2, Lê Văn Việt, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Gogi House - Quán Nướng Hàn Quốc', address: 'Tầng L4, Vincom Plaza, 50 Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Trà Sữa Wait Tea Vietnam', address: '503 Lê Văn Việt, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: "Domino's Pizza", address: '196 Lê Văn Việt, P. Tăng Nhơn Phú B, Quận 9, TP. HCM.' },
  { name: 'Gà Rán KFC', address: '193 Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Grill & Cheer - Buffet Nướng & Lẩu', address: 'Vincom Plaza, 50 Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'To Lo Cafe', address: '99 Lê Văn Việt, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Cơm Gà Xối Mỡ', address: '449 Lê Văn Việt, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Trà Sữa Bé Bốn', address: '451 Lê Văn Việt, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Hutong - Hotpot Paradise', address: 'Tầng L4, Vincom Plaza, 50 Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Lẩu Bò Sài Gòn Vivu', address: 'Tầng 4, Vincom Plaza, 50A Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Kem Thổ - Turkish Ice Cream', address: 'Tầng 4, Vincom Plaza, 50A Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Tào Mạnh Đức - Man Thiện', address: '148B Man Thiện, P. Tân Phú, Quận 9, TP. HCM.' },
  { name: 'BBQ Nướng Sinh Viên', address: '230 Man Thiện, P. Tân Phú, Quận 9, TP. HCM.' },
  { name: 'Mủn Quán Bắc Vị', address: '148B Man Thiện, P. Tân Phú, Quận 9, TP. HCM.' },
  { name: 'Tiệm chè Phan', address: 'Đường Man Thiện, Quận 9, TP. HCM.' },
  { name: 'Gà nướng Man Thiện', address: '274 Man Thiện, P. Tân Phú, Quận 9, TP. HCM.' },
  { name: 'Bò Sốt Hẻm', address: 'Hẻm Man Thiện, Quận 9, TP. HCM.' },
  { name: 'Út Nguyên Quán', address: 'Đường Man Thiện, Quận 9, TP. HCM.' },
  { name: 'Lẩu gà lá é Tao Ngộ 2', address: '423 Man Thiện, P. Tân Phú, Quận 9, TP. HCM.' },
  { name: 'Lẩu bò Năm Cảnh', address: '228 Man Thiện, P. Tân Phú, Quận 9, TP. HCM.' },
  { name: 'Quán 1976', address: '122B Man Thiện, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Sushi Mr Tôm', address: '435 Man Thiện, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Tiệm Đường Đen Chincha', address: '120 Man Thiện, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Cháo Lòng 18A Nam Định', address: '118 Man Thiện, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Bún Bò Diễm', address: '119 Man Thiện, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'BM - Buffet 99k', address: '202A Man Thiện, P. Tân Phú, Quận 9, TP. HCM.' },
  { name: 'Martino Coffee', address: '118A Man Thiện, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'BBQ Tới Bến', address: '188 Man Thiện, P. Tân Phú, Quận 9, TP. HCM.' },
  { name: 'Cơm Vịt Quay Nhất Chi Hương', address: '209 Man Thiện, Quận 9, TP. HCM.' },
  { name: 'Quán Cơm Cô Chín', address: '507 Man Thiện, P. Tân Phú, Quận 9, TP. HCM.' },
  { name: 'Yoyo - Trà Sữa Đài Loan', address: '228B Man Thiện, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Bánh Khọt 45', address: '94A Man Thiện, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Bún đậu Mr Tofu', address: 'Đường Man Thiện, Quận 9, TP. HCM.' },
  { name: 'Cơm niêu Vuông Tròn', address: '4 Đ. Lê Văn Việt, Quận 9, TP. HCM.' },
  { name: 'Lotteria Lê Văn Việt', address: '68 Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Cafe Win', address: '461 Lê Văn Việt, P. Tăng Nhơn Phú B, Quận 9, TP. HCM.' },
  { name: 'Cơm Chay Bửu Đức', address: '277 Lê Văn Việt, P. Tăng Nhơn Phú A, Quận 9, TP. HCM.' },
  { name: 'Vịt Quay Sài Gòn', address: '328 Lê Văn Việt, P. Tăng Nhơn Phú B, Quận 9, TP. HCM.' },
  { name: 'Trà Sữa HongKong Baley', address: '324 Lê Văn Việt, P. Tăng Nhơn Phú B, Quận 9, TP. HCM.' },
  { name: 'Cháo Dinh Dưỡng Việt Soup', address: '275 Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Phở 354', address: '180 Lê Văn Việt, P. Tăng Nhơn Phú B, Quận 9, TP. HCM.' },
  { name: 'Jollibee - Vincom Plaza', address: '50 Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'King BBQ - Vincom Plaza', address: '50 Lê Văn Việt, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Cơm tấm Phúc Lộc Thọ', address: 'Đường Lê Văn Việt, Quận 9, TP. HCM.' },
  { name: 'Quán Lúa', address: '19A đường 182 Lã Xuân Oai, Quận 9, TP. HCM.' },
  { name: 'Heekcaa - Trà Sữa Đài Loan', address: '101 Tân Lập 2, P. Hiệp Phú, Quận 9, TP. HCM.' },
  { name: 'Bún Thái Duy Mạnh', address: '269 Nguyễn Văn Tăng, Quận 9, TP. HCM.' },
  { name: 'Tiệm gà nướng Khôi Phúc', address: '487 Nguyễn Xiển, Quận 9, TP. HCM.' },
  { name: 'Lẩu mắm Phong Lan', address: '26 Long Thuận, Quận 9, TP. HCM.' },
  { name: 'Nhà hàng chay Hạnh Nguyện', address: '6 Hiền Vương, Quận 9, TP. HCM.' },
  { name: 'Vườn Cò Bên Sông', address: '35/4 đường 23, Quận 9, TP. HCM.' },
];

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
        create: {
          userId,
          cuisineScores: { vietnamese: 0.9, street_food: 0.8, hotpot: 0.7, noodles: 0.85 },
          dietaryRestrictions: ['no_peanut'],
          priceRange: 2,
          spiceTolerance: 'medium',
        },
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

    // Xóa toàn bộ quán cũ (mock/demo) và thay bằng dữ liệu thực từ dataquanan.xlsx
    await tx.restaurant.deleteMany({});

    await tx.restaurant.createMany({
      data: REAL_RESTAURANTS.map((r) => ({
        name: r.name,
        address: r.address,
        source: RestaurantSource.USER_SUBMITTED,
        status: RestaurantStatus.APPROVED,
        deletedAt: null,
      })),
      skipDuplicates: false,
    });

    const sampleLockets = [
      {
        id: '40000000-0000-4000-8000-000000000001',
        userId: testerId,
        dishName: 'Phở Bò Tái Nạm Đặc Biệt',
        restaurantName: 'Phở 47',
        note: 'Nước dùng trong, ngọt thanh vị xương hầm, thịt bò mềm tan!',
        rating: 5,
        tags: ['Phở', 'Bò', 'Nước dùng thanh'],
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80',
        deviceHash: 'a'.repeat(64),
        visibility: 'PUBLIC' as const,
        lat: 10.786,
        lng: 106.691,
        capturedAt: new Date(Date.now() - 3600 * 1000),
      },
      {
        id: '40000000-0000-4000-8000-000000000002',
        userId: friendId,
        dishName: 'Bún Bò Huế Chả Cua',
        restaurantName: 'Bún Bò Huế Ba Nghị',
        note: 'Vị sa tế cay nồng đặc trưng Huế, chả cua dai giòn sần sật.',
        rating: 5,
        tags: ['Bún', 'Bún Bò', 'Cay'],
        imageUrl: 'https://images.unsplash.com/photo-1576577445504-6af96477db52?auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1576577445504-6af96477db52?auto=format&fit=crop&w=400&q=80',
        deviceHash: 'b'.repeat(64),
        visibility: 'PUBLIC' as const,
        lat: 10.8468,
        lng: 106.7942,
        capturedAt: new Date(Date.now() - 2 * 3600 * 1000),
      },
      {
        id: '40000000-0000-4000-8000-000000000003',
        userId: testerId,
        dishName: 'Bánh Mì 362 Thập Cẩm',
        restaurantName: 'Bánh Mì 362',
        note: 'Pate béo ngậy, dưa góp chua ngọt giòn rụm.',
        rating: 4,
        tags: ['Bánh Mì', 'Pate', 'Ăn sáng'],
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80',
        deviceHash: 'a'.repeat(64),
        visibility: 'PUBLIC' as const,
        lat: 10.762,
        lng: 106.682,
        capturedAt: new Date(Date.now() - 5 * 3600 * 1000),
      },
      {
        id: '40000000-0000-4000-8000-000000000004',
        userId: friendId,
        dishName: 'Lẩu Bò Nhúng Dấm Chua Cay',
        restaurantName: 'Lẩu Bò Sài Gòn Vivu',
        note: 'Thịt bò tươi mềm, nước lẩu đậm đà vừa miệng, đi nhóm cực vui!',
        rating: 5,
        tags: ['Lẩu', 'Lẩu Nướng', 'Đi Nhóm'],
        imageUrl: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=400&q=80',
        deviceHash: 'b'.repeat(64),
        visibility: 'PUBLIC' as const,
        lat: 10.8459,
        lng: 106.7951,
        capturedAt: new Date(Date.now() - 12 * 3600 * 1000),
      },
    ];

    for (const locket of sampleLockets) {
      await tx.locket.upsert({
        where: { id: locket.id },
        update: locket,
        create: locket,
      });
    }
  }, {
    maxWait: 60000,
    timeout: 60000,
  });

  console.info('Seed hoàn tất.');
  console.info(`Đăng nhập demo: ${demoUsers[0].email} / ${DEMO_PASSWORD}`);
  console.info(`Tài khoản bạn bè: ${demoUsers[1].email} / ${DEMO_PASSWORD}`);
  console.info(`Quán ăn thực tế: ${REAL_RESTAURANTS.length} quán khu vực Man Thiện / Lê Văn Việt, Quận 9.`);
}

seed()
  .catch((error: unknown) => {
    console.error('Seed thất bại:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
