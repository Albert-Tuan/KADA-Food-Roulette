/**
 * Partner Types - B2B Restaurant Partner API
 * Version: 1.0 | Date: 2026-08-09
 */

import { Request } from 'express';
import { PartnerTier, PartnerStatus, DiscountType, PromoStatus, CorporateTier, CorporateStatus } from '@prisma/client';

// ============================================================
// Partner Types
// ============================================================

export interface PartnerRegistrationRequest {
  restaurantId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  tier?: PartnerTier;
}

export interface PartnerUpdateRequest {
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

export interface PartnerResponse {
  id: string;
  restaurantId: string;
  restaurant?: {
    id: string;
    name: string;
    address?: string;
    rating?: number;
  };
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  tier: PartnerTier;
  fixedFeeVND: number;
  ppvRateVND: number;
  status: PartnerStatus;
  referralCode?: string;
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
  analytics: PartnerAnalytics;
  createdAt: Date;
}

export interface PartnerAnalytics {
  totalVisits: number;
  monthlyVisits: number;
  profileViews: number;
  avgRating: number;
  reviewCount: number;
  topDay?: string;
  peakHour?: number;
  lastVisitAt?: Date;
}

export interface PartnerDashboardResponse {
  partner: PartnerResponse;
  recentVisits: VisitSummary[];
  weeklyReport: WeeklyReport;
  scoreBreakdown: ScoreBreakdown;
  recommendations: string[];
}

export interface VisitSummary {
  id: string;
  userId: string;
  verifiedAt: Date;
  billingMonth: string;
  billed: boolean;
}

export interface WeeklyReport {
  weekNumber: number;
  profileViews: number;
  rouletteAppearances: number;
  checkIns: number;
  reviews: number;
  avgRating: number;
  topDay: string;
  peakTime: string;
  nearestUser: number; // meters
}

export interface ScoreBreakdown {
  overallScore: number;
  percentile: number;
  distance: number; // 0-100
  rating: number; // 0-100
  partner: number; // 0-100
  recency: number; // 0-100
  tips: string[];
}

export interface VisitCheckinRequest {
  partnerId: string;
  userId: string;
  checkInId?: string;
  lat: string;
  lng: string;
  accuracy?: number;
}

export interface VisitVerificationResult {
  verified: boolean;
  distance?: number;
  message: string;
}

// ============================================================
// Promo Code Types
// ============================================================

export interface CreatePromoCodeRequest {
  partnerId: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderVND?: number;
  maxUses?: number;
  validFrom: Date;
  validUntil: Date;
}

export interface PromoCodeResponse {
  id: string;
  partnerId: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderVND: number;
  maxUses: number;
  usedCount: number;
  remaining: number;
  validFrom: Date;
  validUntil: Date;
  status: PromoStatus;
  createdAt: Date;
}

// ============================================================
// Corporate Types
// ============================================================

export interface CorporateRegistrationRequest {
  companyName: string;
  companyEmail: string;
  companyPhone?: string;
  taxId?: string;
  address?: string;
  tier?: CorporateTier;
  maxSeats?: number;
}

export interface AddCorporateMemberRequest {
  userId: string;
  role?: 'USER' | 'ADMIN' | 'MANAGER';
  expiresAt?: Date;
}

export interface CorporateDashboardResponse {
  account: {
    id: string;
    companyName: string;
    companyEmail: string;
    tier: CorporateTier;
    maxSeats: number;
    usedSeats: number;
    status: CorporateStatus;
    subscriptionStart?: Date;
    subscriptionEnd?: Date;
  };
  members: {
    id: string;
    userId: string;
    role: string;
    status: string;
    joinedAt: Date;
    expiresAt?: Date;
  }[];
  billing: {
    monthly: number;
    totalSeats: number;
    perSeatCost: number;
  };
}

// ============================================================
// Billing Types
// ============================================================

export interface MonthlyBillingSummary {
  partnerId: string;
  billingMonth: string; // YYYY-MM
  fixedFeeVND: number;
  visitCount: number;
  ppvTotalVND: number;
  totalVND: number;
  visits: {
    id: string;
    userId: string;
    verifiedAt: Date;
  }[];
}

export interface BillingInvoice {
  id: string;
  partnerId: string;
  billingMonth: string;
  fixedFeeVND: number;
  visitCount: number;
  ppvRateVND: number;
  ppvTotalVND: number;
  totalVND: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  dueDate: Date;
  paidAt?: Date;
}

// ============================================================
// Featured Placement Types
// ============================================================

export interface FeaturedPlacementScore {
  restaurantId: string;
  partnerTier: PartnerTier;
  distance: number;
  rating: number;
  recencyDays: number;
  overallScore: number;
  isTopThree: boolean;
  isTopFive: boolean;
}

// ============================================================
// Authenticated Request
// ============================================================

// Note: AuthRequest type is defined in partner.controller.ts
// Using Request from Express directly

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
