export interface TestAccount {
  id: string;
  name: string;
  roleTitle: string;
  badgeEmoji: string;
  email: string;
  password: string;
  displayNamePrivate: string;
  displayNamePublic: string;
  publicId: string;
  avatarUrl: string;
  bio: string;
  role: 'USER' | 'STEWARD' | 'ADMIN';
  xp: number;
  coins: number;
  streakDays: number;
  stats: {
    locketCount: number;
    checkInCount: number;
    groupCount: number;
  };
  tasteProfile: {
    spicy: number;
    sweet: number;
    healthy: number;
    savory: number;
    sour: number;
    description: string;
  };
  lockets: Array<{
    id: string;
    title: string;
    date: string;
    imageUrl: string;
  }>;
}

export const MOCK_TEST_ACCOUNTS: TestAccount[] = [
  {
    id: 'test-user-1',
    name: 'Minh Tuấn (VIP Tester)',
    roleTitle: 'Thành viên VIP',
    badgeEmoji: '👑',
    email: 'test@foodroulette.app',
    password: 'password123',
    displayNamePrivate: 'Minh Tuấn (VIP)',
    displayNamePublic: 'minhtuan_foodie',
    publicId: 'minhtuan_foodie',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    bio: 'Chuyên gia săn quán ngon cùng hội bạn. Mê quay Roulette & ăn đồ nướng lẩu trưa hàng tuần!',
    role: 'USER',
    xp: 2450,
    coins: 350,
    streakDays: 12,
    stats: {
      locketCount: 24,
      checkInCount: 48,
      groupCount: 12,
    },
    tasteProfile: {
      spicy: 85,
      sweet: 60,
      healthy: 40,
      savory: 90,
      sour: 70,
      description: 'Tín đồ của vị Cay & Đậm Đà (Savory)!',
    },
    lockets: [
      {
        id: 'l1',
        title: 'Mì Cay Sasin 7 Cấp Độ',
        date: 'Hôm qua',
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'l2',
        title: 'Lẩu Cua Đồng Ba Béo',
        date: '3 ngày trước',
        imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'l3',
        title: 'Nướng BBQ Hàn Quốc',
        date: '5 ngày trước',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'test-user-2',
    name: 'Hương Giang (Reviewer)',
    roleTitle: 'Chuyên gia ẩm thực',
    badgeEmoji: '🍲',
    email: 'reviewer@foodroulette.app',
    password: 'password123',
    displayNamePrivate: 'Hương Giang',
    displayNamePublic: 'giang_gourmet',
    publicId: 'giang_gourmet',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    bio: 'Blogger ẩm thực 🔍 Chuyên khám phá món ăn Healthy, Trà bánh tráng miệng & Quán ngõ ngách!',
    role: 'USER',
    xp: 4100,
    coins: 620,
    streakDays: 18,
    stats: {
      locketCount: 52,
      checkInCount: 95,
      groupCount: 20,
    },
    tasteProfile: {
      spicy: 40,
      sweet: 85,
      healthy: 90,
      savory: 65,
      sour: 50,
      description: 'Đam mê đồ Healthy & Bánh Ngọt Tráng Miệng!',
    },
    lockets: [
      {
        id: 'l21',
        title: 'Matcha Crepe Cake',
        date: 'Hôm nay',
        imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'l22',
        title: 'Salad Avocado Bơ Tươi',
        date: '2 ngày trước',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'l23',
        title: 'Bún Chả Hương Liên',
        date: '4 ngày trước',
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'test-user-3',
    name: 'Khang Steward (Admin)',
    roleTitle: 'Steward duyệt quán',
    badgeEmoji: '🛡️',
    email: 'steward@foodroulette.app',
    password: 'password123',
    displayNamePrivate: 'Khang Steward',
    displayNamePublic: 'khang_steward',
    publicId: 'khang_steward',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80',
    bio: 'Steward kiểm duyệt vị trí nhà hàng Food Roulette. Đã xác minh thành công 200+ địa điểm thật.',
    role: 'STEWARD',
    xp: 5400,
    coins: 880,
    streakDays: 30,
    stats: {
      locketCount: 88,
      checkInCount: 140,
      groupCount: 35,
    },
    tasteProfile: {
      spicy: 70,
      sweet: 50,
      healthy: 75,
      savory: 95,
      sour: 60,
      description: 'Yêu thích Ẩm thực Việt Nam Chuẩn Vị Truyền Thống!',
    },
    lockets: [
      {
        id: 'l31',
        title: 'Phở Thìn Bờ Hồ Truyền Thống',
        date: 'Vừa xong',
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'l32',
        title: 'Cơm Tấm Sườn Bì Chả 88',
        date: 'Hôm qua',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'l33',
        title: 'Bánh Xèo Miền Tây Giòn Rụm',
        date: '3 ngày trước',
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'test-user-4',
    name: 'Bảo Ngọc (Member)',
    roleTitle: 'Thành viên nhóm',
    badgeEmoji: '👥',
    email: 'member@foodroulette.app',
    password: 'password123',
    displayNamePrivate: 'Bảo Ngọc',
    displayNamePublic: 'ngoc_group',
    publicId: 'ngoc_group',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    bio: 'Sinh viên hay ăn vặt cùng hội cạ cứng 🧋 Cần AI gợi ý quán ăn ngon giá học sinh!',
    role: 'USER',
    xp: 850,
    coins: 90,
    streakDays: 3,
    stats: {
      locketCount: 12,
      checkInCount: 15,
      groupCount: 6,
    },
    tasteProfile: {
      spicy: 60,
      sweet: 90,
      healthy: 35,
      savory: 70,
      sour: 80,
      description: 'Cuồng Trà Sữa & Đồ Ăn Vặt Đường Phố!',
    },
    lockets: [
      {
        id: 'l41',
        title: 'Bánh Tráng Nướng Đà Lạt',
        date: 'Hôm qua',
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'l42',
        title: 'Trà Sữa Phô Mai Tươi',
        date: '2 ngày trước',
        imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
];
