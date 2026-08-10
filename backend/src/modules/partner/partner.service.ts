/**
 * Partner Service - B2B Restaurant Partner Business Logic
 * Version: 1.1 | Date: 2026-08-09 | Fixed TypeScript types
 */

import { prisma } from '../../shared/utils/prisma';
import { PartnerTier, PartnerStatus, CorporateTier, DiscountType, PromoStatus, RestaurantVisit } from '@prisma/client';
import {
  PartnerRegistrationRequest,
  PartnerUpdateRequest,
  VisitCheckinRequest,
  VisitVerificationResult,
  CreatePromoCodeRequest,
  PartnerAnalytics,
  WeeklyReport,
  ScoreBreakdown,
  MonthlyBillingSummary,
  FeaturedPlacementScore,
} from './partner.types';

// ============================================================
// Constants
// ============================================================

const TIER_CONFIG: Record<PartnerTier, { fixedFeeVND: number; ppvRateVND: number; tierBoost: number }> = {
  [PartnerTier.BASIC]: { fixedFeeVND: 0, ppvRateVND: 0, tierBoost: 0 },
  [PartnerTier.BRONZE]: { fixedFeeVND: 99000, ppvRateVND: 5000, tierBoost: 0.15 },
  [PartnerTier.SILVER]: { fixedFeeVND: 199000, ppvRateVND: 4000, tierBoost: 0.25 },
  [PartnerTier.GOLD]: { fixedFeeVND: 399000, ppvRateVND: 3000, tierBoost: 0.35 },
};

const MAX_CHECKIN_DISTANCE_METERS = 100;

// ============================================================
// Partner Registration
// ============================================================

export async function registerPartner(data: PartnerRegistrationRequest) {
  const tier = data.tier || PartnerTier.BASIC;
  const config = TIER_CONFIG[tier];

  // Check if restaurant already has a partner
  const existing = await prisma.restaurantPartner.findUnique({
    where: { restaurantId: data.restaurantId },
  });

  if (existing) {
    throw new Error('Restaurant already has a partner');
  }

  // Verify restaurant exists
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: data.restaurantId },
  });

  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  // Generate referral code
  const referralCode = generateReferralCode(restaurant.name);

  return prisma.restaurantPartner.create({
    data: {
      restaurantId: data.restaurantId,
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail,
      ownerPhone: data.ownerPhone,
      tier,
      fixedFeeVND: config.fixedFeeVND,
      ppvRateVND: config.ppvRateVND,
      referralCode,
      status: tier === PartnerTier.BASIC ? PartnerStatus.ACTIVE : PartnerStatus.TRIAL,
    },
    include: {
      restaurant: {
        select: { id: true, name: true, address: true, rating: true },
      },
    },
  });
}

export async function updatePartner(partnerId: string, data: PartnerUpdateRequest) {
  return prisma.restaurantPartner.update({
    where: { id: partnerId },
    data,
    include: {
      restaurant: {
        select: { id: true, name: true, address: true, rating: true },
      },
    },
  });
}

export async function upgradePartnerTier(partnerId: string, newTier: PartnerTier) {
  const config = TIER_CONFIG[newTier];

  return prisma.restaurantPartner.update({
    where: { id: partnerId },
    data: {
      tier: newTier,
      fixedFeeVND: config.fixedFeeVND,
      ppvRateVND: config.ppvRateVND,
      status: PartnerStatus.ACTIVE,
    },
  });
}

export async function getPartnerByRestaurant(restaurantId: string) {
  return prisma.restaurantPartner.findUnique({
    where: { restaurantId },
    include: {
      restaurant: {
        select: { id: true, name: true, address: true, rating: true },
      },
    },
  });
}

export async function getPartnerById(partnerId: string) {
  return prisma.restaurantPartner.findUnique({
    where: { id: partnerId },
    include: {
      restaurant: {
        select: { id: true, name: true, address: true, rating: true },
      },
      visits: {
        orderBy: { verifiedAt: 'desc' },
        take: 10,
      },
      promoCodes: {
        where: { status: PromoStatus.ACTIVE },
        orderBy: { validUntil: 'asc' },
      },
    },
  });
}

// ============================================================
// Analytics
// ============================================================

export async function getPartnerAnalytics(partnerId: string): Promise<PartnerAnalytics> {
  const partner = await prisma.restaurantPartner.findUnique({
    where: { id: partnerId },
    include: {
      restaurant: { include: { checkIns: true } },
      visits: {
        where: { verifiedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      },
    },
  });

  if (!partner) throw new Error('Partner not found');

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const visits = await prisma.restaurantVisit.findMany({
    where: { partnerId, verifiedAt: { gte: thirtyDaysAgo } },
  });

  // Calculate top day and peak hour
  const visitByDay: Record<string, number> = {};
  const visitByHour: Record<number, number> = {};

  visits.forEach((v: RestaurantVisit) => {
    const day = v.verifiedAt.toLocaleDateString('vi-VN', { weekday: 'short' });
    const hour = v.verifiedAt.getHours();
    visitByDay[day] = (visitByDay[day] || 0) + 1;
    visitByHour[hour] = (visitByHour[hour] || 0) + 1;
  });

  const topDay = Object.entries(visitByDay).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  const peakHour = Object.entries(visitByHour).sort((a, b) => b[1] - a[1])[0]?.[0] || 12;

  return {
    totalVisits: partner.visits.length,
    monthlyVisits: visits.length,
    profileViews: 0, // Will be tracked separately
    avgRating: partner.restaurant?.rating || 0,
    reviewCount: 0, // Will be linked to Review table
    topDay,
    peakHour: Number(peakHour),
    lastVisitAt: visits[0]?.verifiedAt,
  };
}

export async function getWeeklyReport(partnerId: string): Promise<WeeklyReport> {
  const weekStart = getWeekStart();
  const visits = await prisma.restaurantVisit.findMany({
    where: {
      partnerId,
      verifiedAt: { gte: weekStart },
    },
  });

  // Calculate peak time
  const visitByHour: Record<number, number> = {};
  visits.forEach((v: RestaurantVisit) => {
    const hour = v.verifiedAt.getHours();
    visitByHour[hour] = (visitByHour[hour] || 0) + 1;
  });

  const sortedHours = Object.entries(visitByHour).sort((a, b) => b[1] - a[1]);
  const peakHourValue = sortedHours[0]?.[0] || '12';
  const peakTime = `${peakHourValue}:00`;

  // Calculate top day
  const visitByDay: Record<string, number> = {};
  visits.forEach((v: RestaurantVisit) => {
    const day = v.verifiedAt.toLocaleDateString('vi-VN', { weekday: 'short' });
    visitByDay[day] = (visitByDay[day] || 0) + 1;
  });
  const topDay = Object.entries(visitByDay).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  return {
    weekNumber: getWeekNumber(),
    profileViews: 0,
    rouletteAppearances: 0,
    checkIns: visits.length,
    reviews: 0,
    avgRating: 0,
    topDay,
    peakTime,
    nearestUser: 200,
  };
}

export async function getScoreBreakdown(partnerId: string): Promise<ScoreBreakdown> {
  const partner = await prisma.restaurantPartner.findUnique({
    where: { id: partnerId },
    include: { restaurant: true },
  });

  if (!partner) throw new Error('Partner not found');

  // Calculate weights
  const distanceWeight = 80; // Simulated - user location dependent
  const ratingWeight = Math.round((partner.restaurant?.rating || 0) / 5 * 100);
  const tierConfig = TIER_CONFIG[partner.tier];
  const tierWeight = Math.round(tierConfig.tierBoost * 100);

  // Calculate recency
  const lastVisit = await prisma.restaurantVisit.findFirst({
    where: { partnerId },
    orderBy: { verifiedAt: 'desc' },
  });

  const recencyDays = lastVisit
    ? Math.floor((Date.now() - lastVisit.verifiedAt.getTime()) / (1000 * 60 * 60 * 24))
    : 30;
  const recencyWeight = Math.max(0, Math.round((1 - recencyDays / 30) * 100));

  const overallScore =
    distanceWeight * 0.4 +
    ratingWeight * 0.3 +
    tierWeight * 0.2 +
    recencyWeight * 0.1;

  const tips: string[] = [];
  if (partner.tier === PartnerTier.BASIC) {
    tips.push('Upgrade lên Silver để +15% visibility');
  }
  if (!partner.restaurant?.rating || partner.restaurant.rating < 4) {
    tips.push('Thêm ảnh để cải thiện rating');
  }
  if (recencyDays > 7) {
    tips.push('Check-in để tăng recency score');
  }

  return {
    overallScore: Math.round(overallScore * 100) / 100,
    percentile: Math.round(100 - recencyDays),
    distance: distanceWeight,
    rating: ratingWeight,
    partner: tierWeight,
    recency: recencyWeight,
    tips,
  };
}

// ============================================================
// Visit Verification
// ============================================================

export async function verifyVisitDistance(
  checkinGps: { lat: number; lng: number },
  restaurantLocation: { lat: number; lng: number }
): Promise<{ verified: boolean; distance: number }> {
  const distance = calculateHaversineDistance(
    checkinGps.lat,
    checkinGps.lng,
    Number(restaurantLocation.lat),
    Number(restaurantLocation.lng)
  );

  return {
    verified: distance <= MAX_CHECKIN_DISTANCE_METERS,
    distance: Math.round(distance),
  };
}

export async function recordVisit(data: VisitCheckinRequest): Promise<VisitVerificationResult> {
  const partner = await prisma.restaurantPartner.findUnique({
    where: { id: data.partnerId },
    include: { restaurant: true },
  });

  if (!partner) {
    return { verified: false, message: 'Partner not found' };
  }

  if (partner.status !== PartnerStatus.ACTIVE && partner.status !== PartnerStatus.TRIAL) {
    return { verified: false, message: 'Partner account is not active' };
  }

  if (!partner.restaurant?.lat || !partner.restaurant?.lng) {
    return { verified: false, message: 'Restaurant location not available' };
  }

  const { verified, distance } = await verifyVisitDistance(
    { lat: Number(data.lat), lng: Number(data.lng) },
    { lat: Number(partner.restaurant.lat), lng: Number(partner.restaurant.lng) }
  );

  if (!verified) {
    return {
      verified: false,
      distance,
      message: `Bạn cách quán ${distance}m. Cần trong phạm vi 100m để check-in.`,
    };
  }

  // Record the visit
  const billingMonth = new Date().toISOString().slice(0, 7);

// Helper to convert number to Prisma Decimal-compatible string
function toPrismaDecimal(value: string | number): string {
  return String(value);
}

  const visit = await prisma.restaurantVisit.create({
    data: {
      partnerId: data.partnerId,
      userId: data.userId,
      checkInId: data.checkInId,
      lat: toPrismaDecimal(data.lat) as any,
      lng: toPrismaDecimal(data.lng) as any,
      accuracy: data.accuracy,
      billingMonth,
    },
  });

  // Update analytics denormalized field
  const currentAnalytics = (partner.analytics as Record<string, unknown>) || {};
  await prisma.restaurantPartner.update({
    where: { id: data.partnerId },
    data: {
      analytics: {
        ...currentAnalytics,
        totalVisits: ((currentAnalytics.totalVisits as number) || 0) + 1,
        lastVisitAt: new Date().toISOString(),
      },
    },
  });

  return {
    verified: true,
    distance,
    message: 'Check-in thành công! Cảm ơn bạn đã ghé thăm.',
  };
}

// ============================================================
// Billing
// ============================================================

export async function getMonthlyBilling(
  partnerId: string,
  billingMonth: string
): Promise<MonthlyBillingSummary> {
  const partner = await prisma.restaurantPartner.findUnique({
    where: { id: partnerId },
  });

  if (!partner) throw new Error('Partner not found');

  const visits = await prisma.restaurantVisit.findMany({
    where: { partnerId, billingMonth, billed: false },
  });

  const ppvTotal = visits.length * partner.ppvRateVND;

  return {
    partnerId,
    billingMonth,
    fixedFeeVND: partner.fixedFeeVND,
    visitCount: visits.length,
    ppvTotalVND: ppvTotal,
    totalVND: partner.fixedFeeVND + ppvTotal,
    visits: visits.map((v) => ({
      id: v.id,
      userId: v.userId,
      verifiedAt: v.verifiedAt,
    })),
  };
}

export async function markVisitsAsBilled(partnerId: string, billingMonth: string) {
  return prisma.restaurantVisit.updateMany({
    where: { partnerId, billingMonth, billed: false },
    data: { billed: true, billedAt: new Date() },
  });
}

// ============================================================
// Featured Placement
// ============================================================

export async function getFeaturedPlacementScore(
  restaurantId: string
): Promise<FeaturedPlacementScore> {
  const partner = await prisma.restaurantPartner.findUnique({
    where: { restaurantId },
    include: { restaurant: true },
  });

  if (!partner) {
    return {
      restaurantId,
      partnerTier: PartnerTier.BASIC,
      distance: 0,
      rating: 0,
      recencyDays: 0,
      overallScore: 0,
      isTopThree: false,
      isTopFive: false,
    };
  }

  const lastVisit = await prisma.restaurantVisit.findFirst({
    where: { partnerId: partner.id },
    orderBy: { verifiedAt: 'desc' },
  });

  const recencyDays = lastVisit
    ? Math.floor((Date.now() - lastVisit.verifiedAt.getTime()) / (1000 * 60 * 60 * 24))
    : 30;

  const tierConfig = TIER_CONFIG[partner.tier];
  const ratingScore = (partner.restaurant?.rating || 0) / 5;
  const recencyScore = Math.max(0, 1 - recencyDays / 30);

  const overallScore =
    ratingScore * 0.4 +
    tierConfig.tierBoost +
    recencyScore * 0.1;

  return {
    restaurantId,
    partnerTier: partner.tier,
    distance: 0,
    rating: partner.restaurant?.rating || 0,
    recencyDays,
    overallScore,
    isTopThree: partner.tier === PartnerTier.GOLD,
    isTopFive: partner.tier === PartnerTier.SILVER || partner.tier === PartnerTier.GOLD,
  };
}

// ============================================================
// Promo Codes
// ============================================================

export async function createPromoCode(data: CreatePromoCodeRequest) {
  // Check if code already exists
  const existing = await prisma.promoCode.findUnique({
    where: { code: data.code },
  });

  if (existing) {
    throw new Error('Promo code already exists');
  }

  return prisma.promoCode.create({
    data: {
      partnerId: data.partnerId,
      code: data.code.toUpperCase(),
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderVND: data.minOrderVND || 0,
      maxUses: data.maxUses || 100,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
    },
  });
}

export async function getPromoCodes(partnerId: string) {
  return prisma.promoCode.findMany({
    where: { partnerId },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================================
// Corporate Account
// ============================================================

export async function createCorporateAccount(data: {
  companyName: string;
  companyEmail: string;
  companyPhone?: string;
  taxId?: string;
  address?: string;
  tier?: CorporateTier;
  maxSeats?: number;
}) {
  return prisma.corporateAccount.create({
    data: {
      companyName: data.companyName,
      companyEmail: data.companyEmail,
      companyPhone: data.companyPhone,
      taxId: data.taxId,
      address: data.address,
      tier: data.tier || CorporateTier.BASIC,
      maxSeats: data.maxSeats || 10,
      status: 'TRIAL',
    },
  });
}

export async function addCorporateMember(
  accountId: string,
  userId: string,
  role: 'USER' | 'ADMIN' | 'MANAGER' = 'USER'
) {
  return prisma.corporateMember.create({
    data: {
      accountId,
      userId,
      role,
    },
  });
}

// ============================================================
// Helper Functions
// ============================================================

function generateReferralCode(name: string): string {
  const prefix = name
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${random}`;
}

function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff));
}

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil(diff / oneWeek);
}
