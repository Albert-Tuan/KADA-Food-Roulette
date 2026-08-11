/**
 * Database Seed - Default data
 * Run: `npx prisma db seed`
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Default achievements cho gamification system
 * Reference: docs/decisions/005-gamification.md (planned)
 */
const DEFAULT_ACHIEVEMENTS = [
  {
    code: 'first_spin',
    name: 'Khởi đầu',
    description: 'Hoàn thành spin đầu tiên',
    category: 'activity',
    condition: JSON.stringify({ type: 'spin_count', threshold: 1 }),
    xpReward: 10,
    iconUrl: '/badges/first-spin.png',
  },
  {
    code: 'spinner_10',
    name: 'Người quay',
    description: 'Hoàn thành 10 spins',
    category: 'milestone',
    condition: JSON.stringify({ type: 'spin_count', threshold: 10 }),
    xpReward: 50,
    iconUrl: '/badges/spinner-10.png',
  },
  {
    code: 'spinner_100',
    name: 'Master Spinner',
    description: 'Hoàn thành 100 spins',
    category: 'milestone',
    condition: JSON.stringify({ type: 'spin_count', threshold: 100 }),
    xpReward: 200,
    iconUrl: '/badges/spinner-100.png',
  },
  {
    code: 'week_streak',
    name: '1 Tuần',
    description: 'Ăn uống 7 ngày liên tiếp',
    category: 'milestone',
    condition: JSON.stringify({ type: 'streak', threshold: 7 }),
    xpReward: 100,
    iconUrl: '/badges/week-streak.png',
  },
  {
    code: 'month_streak',
    name: '1 Tháng',
    description: 'Ăn uống 30 ngày liên tiếp',
    category: 'milestone',
    condition: JSON.stringify({ type: 'streak', threshold: 30 }),
    xpReward: 500,
    iconUrl: '/badges/month-streak.png',
  },
  {
    code: 'foodie_10',
    name: 'Foodie',
    description: 'Thử 10 quán ăn khác nhau',
    category: 'milestone',
    condition: JSON.stringify({ type: 'unique_restaurants', threshold: 10 }),
    xpReward: 50,
    iconUrl: '/badges/foodie-10.png',
  },
  {
    code: 'social_butterfly',
    name: 'Bướm xã hội',
    description: 'Tham gia 5 group spins',
    category: 'social',
    condition: JSON.stringify({ type: 'group_spin_count', threshold: 5 }),
    xpReward: 75,
    iconUrl: '/badges/social-butterfly.png',
  },
  {
    code: 'night_owl',
    name: 'Chim cú',
    description: 'Spin 10 lần sau 22h',
    category: 'secret',
    condition: JSON.stringify({ type: 'late_night_spins', threshold: 10 }),
    xpReward: 30,
    iconUrl: '/badges/night-owl.png',
    isSecret: true,
  },
  {
    code: 'early_bird',
    name: 'Chim sớm',
    description: 'Spin 10 lần trước 8h',
    category: 'secret',
    condition: JSON.stringify({ type: 'early_morning_spins', threshold: 10 }),
    xpReward: 30,
    iconUrl: '/badges/early-bird.png',
    isSecret: true,
  },
  {
    code: 'world_explorer',
    name: 'Khám phá',
    description: 'Ăn ở 5 thành phố khác nhau (multi-city)',
    category: 'milestone',
    condition: JSON.stringify({ type: 'unique_cities', threshold: 5 }),
    xpReward: 150,
    iconUrl: '/badges/world-explorer.png',
  },
];

/**
 * Default cities cho multi-city feature (v2.0)
 */
const DEFAULT_CITIES = [
  {
    code: 'HCMC',
    name: 'TP. Hồ Chí Minh',
    region: 'south',
    latitude: 10.8231,
    longitude: 106.6297,
    zoomLevel: 12,
  },
  {
    code: 'HANOI',
    name: 'Hà Nội',
    region: 'north',
    latitude: 21.0285,
    longitude: 105.8542,
    zoomLevel: 12,
  },
  {
    code: 'DANANG',
    name: 'Đà Nẵng',
    region: 'central',
    latitude: 16.0544,
    longitude: 108.2022,
    zoomLevel: 13,
  },
  {
    code: 'CANTHO',
    name: 'Cần Thơ',
    region: 'south',
    latitude: 10.0452,
    longitude: 105.7469,
    zoomLevel: 13,
  },
  {
    code: 'HAIPHONG',
    name: 'Hải Phòng',
    region: 'north',
    latitude: 20.8449,
    longitude: 106.6881,
    zoomLevel: 13,
  },
];

async function main() {
  console.log('🌱 Seeding database...\n');

  // Achievements
  console.log('📛 Seeding achievements...');
  for (const achievement of DEFAULT_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: {},
      create: achievement,
    });
  }
  console.log(`  ✅ ${DEFAULT_ACHIEVEMENTS.length} achievements\n`);

  // Cities
  console.log('🏙️ Seeding cities...');
  for (const city of DEFAULT_CITIES) {
    await prisma.city.upsert({
      where: { code: city.code },
      update: {},
      create: city,
    });
  }
  console.log(`  ✅ ${DEFAULT_CITIES.length} cities\n`);

  console.log('✨ Done!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });