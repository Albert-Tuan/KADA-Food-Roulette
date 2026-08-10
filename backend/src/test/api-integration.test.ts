// ============================================================
// API INTEGRATION VALIDATION v5.0
// Test Prisma client can read/write all entities
// ============================================================

import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { describe, expect, it } from 'vitest';

const prisma = new PrismaClient();

async function validateApiIntegration() {
  console.log('Starting API Integration Validation...\n');

  const resourceIds = {
    user: randomUUID(),
    user2: randomUUID(),
    friendship: randomUUID(),
    restaurant: randomUUID(),
    hours: randomUUID(),
    photo: randomUUID(),
    group: randomUUID(),
    spinSession: randomUUID(),
    vote: randomUUID(),
    locket: randomUUID(),
    checkIn: randomUUID(),
  };

  try {

  // ============================================================
  // CHECK 7.1: User CRUD
  // ============================================================
  console.log('CHECK 7.1: User CRUD');
  
  // Create user
  const user = await prisma.user.create({
    data: {
      id: resourceIds.user,
      email: `api_test_${resourceIds.user}@example.com`,
      passwordHash: 'hashed_password',
      displayNamePrivate: 'API Test Private',
      displayNamePublic: 'API Test Public',
      publicId: resourceIds.user.replaceAll('-', '').slice(0, 20),
    },
  });
  console.log('✓ Create user:', user.id);

  // Read user
  const foundUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { spinWallet: true },
  });
  console.log('✓ Read user with wallet:', foundUser?.email);

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { isOnboarded: true },
  });
  console.log('✓ Update user:', updatedUser.isOnboarded);

  // ============================================================
  // CHECK 7.2: Friendship operations
  // ============================================================
  console.log('\nCHECK 7.2: Friendship operations');

  const user2 = await prisma.user.create({
    data: {
      id: resourceIds.user2,
      email: `api_test_${resourceIds.user2}@example.com`,
      passwordHash: 'hash2',
      displayNamePrivate: 'User 2 Private',
      displayNamePublic: 'User 2 Public',
      publicId: resourceIds.user2.replaceAll('-', '').slice(0, 20),
    },
  });

  // Send friend request
  const friendship = await prisma.friendship.create({
    data: {
      id: resourceIds.friendship,
      requesterId: user.id,
      addresseeId: user2.id,
      status: 'PENDING',
    },
  });
  console.log('✓ Create friendship:', friendship.id);

  // Accept friendship
  const acceptedFriendship = await prisma.friendship.update({
    where: { id: friendship.id },
    data: { status: 'ACCEPTED' },
  });
  console.log('✓ Accept friendship:', acceptedFriendship.status);

  // Get mutual friends
  const mutualFriends = await prisma.friendship.findMany({
    where: {
      OR: [
        { requesterId: user.id },
        { addresseeId: user.id },
      ],
      status: 'ACCEPTED',
    },
    include: {
      requester: true,
      addressee: true,
    },
  });
  console.log('✓ Find mutual friends:', mutualFriends.length);

  // ============================================================
  // CHECK 7.3: Restaurant operations
  // ============================================================
  console.log('\nCHECK 7.3: Restaurant operations');

  const restaurant = await prisma.restaurant.create({
    data: {
      id: resourceIds.restaurant,
      name: 'API Test Restaurant',
      source: 'USER_SUBMITTED',
      status: 'PENDING',
    },
  });
  console.log('✓ Create restaurant:', restaurant.id);

  // Add hours
  const hours = await prisma.restaurantHours.create({
    data: {
      id: resourceIds.hours,
      restaurantId: restaurant.id,
      dayOfWeek: 1,
      openTime: '09:00',
      closeTime: '22:00',
    },
  });
  console.log('✓ Add restaurant hours:', hours.id);

  // Add photo
  const photo = await prisma.restaurantPhoto.create({
    data: {
      id: resourceIds.photo,
      restaurantId: restaurant.id,
      photoUrl: 'http://example.com/photo.jpg',
      displayOrder: 1,
    },
  });
  console.log('✓ Add restaurant photo:', photo.id);

  // Query with filters
  const approvedRestaurants = await prisma.restaurant.findMany({
    where: {
      status: 'APPROVED',
      deletedAt: null,
    },
  });
  console.log('✓ Query approved restaurants:', approvedRestaurants.length);

  // ============================================================
  // CHECK 7.4: Group Spin operations
  // ============================================================
  console.log('\nCHECK 7.4: Group Spin operations');

  const group = await prisma.group.create({
    data: {
      id: resourceIds.group,
      name: 'API Test Group',
      maxMembers: 20,
    },
  });
  console.log('✓ Create group:', group.id);

  // Add members
  await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId: user.id,
      role: 'HOST',
      status: 'ACCEPTED',
    },
  });
  console.log('✓ Add host to group');

  await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId: user2.id,
      role: 'MEMBER',
      status: 'ACCEPTED',
    },
  });
  console.log('✓ Add member to group');

  // Check member count
  const memberCount = await prisma.groupMember.count({
    where: {
      groupId: group.id,
      status: 'ACCEPTED',
    },
  });
  console.log('✓ Group member count:', memberCount);

  // ============================================================
  // CHECK 7.5: Spin Session operations
  // ============================================================
  console.log('\nCHECK 7.5: Spin Session operations');

  const spinSession = await prisma.spinSession.create({
    data: {
      id: resourceIds.spinSession,
      groupId: group.id,
      initiatorId: user.id,
      status: 'ACTIVE',
    },
  });
  console.log('✓ Create spin session:', spinSession.id);

  // Add candidates
  await prisma.spinSessionCandidate.createMany({
    data: [
      { spinSessionId: spinSession.id, restaurantId: restaurant.id, displayOrder: 1 },
    ],
  });
  console.log('✓ Add candidates to session');

  // Add vote
  const vote = await prisma.vote.create({
    data: {
      id: resourceIds.vote,
      spinSessionId: spinSession.id,
      userId: user.id,
      value: 'ACCEPT',
    },
  });
  console.log('✓ Add vote:', vote.id);

  // Count votes by type
  const voteCounts = await prisma.vote.groupBy({
    by: ['value'],
    _count: true,
    where: { spinSessionId: spinSession.id },
  });
  console.log('✓ Vote counts:', voteCounts);

  // ============================================================
  // CHECK 7.6: Locket operations
  // ============================================================
  console.log('\nCHECK 7.6: Locket operations');

  const locket = await prisma.locket.create({
    data: {
      id: resourceIds.locket,
      userId: user.id,
      restaurantId: restaurant.id,
      imageUrl: `lockets/${user.id}/${resourceIds.locket}/original.jpg`,
      thumbnailUrl: `lockets/${user.id}/${resourceIds.locket}/thumbnail.jpg`,
      imageWidth: 1200,
      imageHeight: 1600,
      imageBytes: 345678,
      thumbnailBytes: 45678,
      dishName: 'API Test Dish',
      deviceHash: 'test_hash_123',
      capturedAt: new Date(),
      visibility: 'FRIENDS',
    },
  });
  console.log('✓ Create locket:', locket.id);

  const persistedMedia = await prisma.locket.findUnique({
    where: { id: locket.id },
    select: {
      thumbnailUrl: true,
      imageWidth: true,
      imageHeight: true,
      imageBytes: true,
      thumbnailBytes: true,
    },
  });
  expect(persistedMedia).toEqual({
    thumbnailUrl: `lockets/${user.id}/${resourceIds.locket}/thumbnail.jpg`,
    imageWidth: 1200,
    imageHeight: 1600,
    imageBytes: 345678,
    thumbnailBytes: 45678,
  });

  // Query by visibility
  const publicLockets = await prisma.locket.findMany({
    where: { visibility: 'PUBLIC' },
    orderBy: { capturedAt: 'desc' },
  });
  console.log('✓ Query public lockets:', publicLockets.length);

  // ============================================================
  // CHECK 7.7: Check-In operations
  // ============================================================
  console.log('\nCHECK 7.7: Check-In operations');

  const checkIn = await prisma.checkIn.create({
    data: {
      id: resourceIds.checkIn,
      userId: user.id,
      restaurantId: restaurant.id,
      locketId: locket.id,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    },
  });
  console.log('✓ Create check-in:', checkIn.id);

  // Query active check-ins
  const activeCheckIns = await prisma.checkIn.findMany({
    where: {
      userId: user.id,
      status: 'ACTIVE',
      expiresAt: { gt: new Date() },
    },
  });
  console.log('✓ Query active check-ins:', activeCheckIns.length);

  // ============================================================
  // CHECK 7.8: Spin Wallet operations
  // ============================================================
  console.log('\nCHECK 7.8: Spin Wallet operations');

  // Direct Prisma user creation bypasses the registration service, so create its wallet explicitly.
  const wallet = await prisma.spinWallet.create({
    data: { userId: user.id },
  });
  console.log('✓ Create wallet:', wallet.id);

  // Add spin log
  const spinLog = await prisma.spinLog.create({
    data: {
      walletId: wallet.id,
      amount: BigInt(10),
      source: 'REWARD',
    },
  });
  console.log('✓ Add spin log:', spinLog.id);

  // Check balance
  const updatedWallet = await prisma.spinWallet.findUnique({
    where: { userId: user.id },
  });
  console.log('✓ Wallet balance:', updatedWallet?.balance);

  // ============================================================
  // CHECK 7.9: Complex queries
  // ============================================================
  console.log('\nCHECK 7.9: Complex queries');

  // Get user with all relations
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      spinWallet: { include: { logs: true } },
      friendshipsRequested: true,
      friendshipsReceived: true,
      groupMemberships: { include: { group: true } },
      lockets: { orderBy: { capturedAt: 'desc' }, take: 10 },
    },
  });
  console.log('✓ Get full user profile:', fullUser?.email);

  console.log('\n========================================');
  console.log('API INTEGRATION VALIDATION: ALL PASSED');
  console.log('========================================');
  } finally {
    console.log('\nCleaning up test data...');

    await prisma.vote.deleteMany({ where: { spinSessionId: resourceIds.spinSession } });
    await prisma.spinSessionCandidate.deleteMany({ where: { spinSessionId: resourceIds.spinSession } });
    await prisma.checkIn.deleteMany({ where: { id: resourceIds.checkIn } });
    await prisma.locket.deleteMany({ where: { id: resourceIds.locket } });
    await prisma.spinSession.deleteMany({ where: { id: resourceIds.spinSession } });
    await prisma.groupMember.deleteMany({ where: { groupId: resourceIds.group } });
    await prisma.group.deleteMany({ where: { id: resourceIds.group } });
    await prisma.restaurantPhoto.deleteMany({ where: { id: resourceIds.photo } });
    await prisma.restaurantHours.deleteMany({ where: { id: resourceIds.hours } });
    await prisma.friendship.deleteMany({ where: { id: resourceIds.friendship } });
    await prisma.spinLog.deleteMany({ where: { wallet: { userId: resourceIds.user } } });
    await prisma.spinWallet.deleteMany({ where: { userId: resourceIds.user } });
    await prisma.restaurant.deleteMany({ where: { id: resourceIds.restaurant } });
    await prisma.user.deleteMany({ where: { id: { in: [resourceIds.user, resourceIds.user2] } } });

    console.log('✓ Cleanup complete');
  }
}

describe.skipIf(process.env.RUN_DB_INTEGRATION !== 'true')('database API integration', () => {
  it('validates Prisma CRUD against a configured MySQL database', async () => {
    try {
      await validateApiIntegration();
    } finally {
      await prisma.$disconnect();
    }
  });
});
