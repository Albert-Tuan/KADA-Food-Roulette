/**
 * Partner Controller - B2B Restaurant Partner API Endpoints
 * Version: 1.3 | Date: 2026-08-09 | Fixed imports
 */

import { Response, Request, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import {
  registerPartner,
  updatePartner,
  upgradePartnerTier,
  getPartnerByRestaurant,
  getPartnerById,
  getPartnerAnalytics,
  getWeeklyReport,
  getScoreBreakdown,
  recordVisit,
  getMonthlyBilling,
  markVisitsAsBilled,
  getFeaturedPlacementScore,
  createPromoCode,
  getPromoCodes,
  createCorporateAccount,
  addCorporateMember,
} from './partner.service';

// Use Express Request type
type AuthRequest = Request;

// Helper to cast params to string
const getParam = (val: string | string[]): string => Array.isArray(val) ? val[0] : val;

// ============================================================
// Validation Middleware
// ============================================================

export const partnerValidation = {
  register: [
    body('restaurantId').isUUID().withMessage('Invalid restaurant ID'),
    body('ownerName').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 chars'),
    body('ownerEmail').isEmail().withMessage('Invalid email'),
    body('ownerPhone').optional().isMobilePhone('vi-VN').withMessage('Invalid phone number'),
    body('tier').optional().isIn(['BASIC', 'BRONZE', 'SILVER', 'GOLD']).withMessage('Invalid tier'),
  ],
  update: [
    param('id').isUUID().withMessage('Invalid partner ID'),
    body('ownerName').optional().trim().isLength({ min: 2, max: 100 }),
    body('ownerEmail').optional().isEmail(),
    body('ownerPhone').optional().isMobilePhone('vi-VN'),
  ],
  upgradeTier: [
    param('id').isUUID().withMessage('Invalid partner ID'),
    body('tier').isIn(['BASIC', 'BRONZE', 'SILVER', 'GOLD']).withMessage('Invalid tier'),
  ],
  visitCheckin: [
    body('partnerId').isUUID().withMessage('Invalid partner ID'),
    body('userId').isUUID().withMessage('Invalid user ID'),
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('accuracy').optional().isFloat({ min: 0, max: 1000 }),
  ],
  promoCode: [
    body('code').trim().isLength({ min: 4, max: 20 }).withMessage('Code must be 4-20 chars'),
    body('discountType').isIn(['PERCENTAGE', 'FIXED_VND']).withMessage('Invalid discount type'),
    body('discountValue').isInt({ min: 1 }).withMessage('Invalid discount value'),
    body('validFrom').isISO8601().withMessage('Invalid start date'),
    body('validUntil').isISO8601().withMessage('Invalid end date'),
  ],
  corporateAccount: [
    body('companyName').trim().isLength({ min: 2, max: 255 }).withMessage('Invalid company name'),
    body('companyEmail').isEmail().withMessage('Invalid email'),
    body('companyPhone').optional().isMobilePhone('vi-VN'),
    body('tier').optional().isIn(['BASIC', 'PROFESSIONAL', 'ENTERPRISE']),
  ],
};

// ============================================================
// Partner Endpoints
// ============================================================

/**
 * POST /api/v1/partners - Register a new partner
 */
export async function handleRegisterPartner(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
    });
  }

  try {
    const partner = await registerPartner({
      restaurantId: req.body.restaurantId,
      ownerName: req.body.ownerName,
      ownerEmail: req.body.ownerEmail,
      ownerPhone: req.body.ownerPhone,
      tier: req.body.tier,
    });

    res.status(201).json({
      success: true,
      data: partner,
      message: 'Partner registered successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/v1/partners/:id - Get partner by ID
 */
export async function handleGetPartner(req: AuthRequest, res: Response) {
  try {
    const partner = await getPartnerById(getParam(req.params.id));
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner not found',
      });
    }

    res.json({
      success: true,
      data: partner,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * PUT /api/v1/partners/:id - Update partner info
 */
export async function handleUpdatePartner(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
    });
  }

  try {
    const partner = await updatePartner(getParam(req.params.id), {
      ownerName: req.body.ownerName,
      ownerEmail: req.body.ownerEmail,
      ownerPhone: req.body.ownerPhone,
    });

    res.json({
      success: true,
      data: partner,
      message: 'Partner updated successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * PUT /api/v1/partners/:id/upgrade - Upgrade partner tier
 */
export async function handleUpgradeTier(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
    });
  }

  try {
    const partner = await upgradePartnerTier(getParam(req.params.id), req.body.tier);

    res.json({
      success: true,
      data: partner,
      message: `Upgraded to ${req.body.tier} successfully`,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/v1/partners/restaurant/:restaurantId - Get partner by restaurant
 */
export async function handleGetPartnerByRestaurant(req: AuthRequest, res: Response) {
  try {
    const partner = await getPartnerByRestaurant(getParam(req.params.restaurantId));
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner not found for this restaurant',
      });
    }

    res.json({
      success: true,
      data: partner,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================================
// Dashboard Endpoints
// ============================================================

/**
 * GET /api/v1/partners/:id/dashboard - Get partner dashboard data
 */
export async function handleGetDashboard(req: AuthRequest, res: Response) {
  try {
    const partner = await getPartnerById(getParam(req.params.id));
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner not found',
      });
    }

    const [analytics, weeklyReport, scoreBreakdown] = await Promise.all([
      getPartnerAnalytics(getParam(req.params.id)),
      getWeeklyReport(getParam(req.params.id)),
      getScoreBreakdown(getParam(req.params.id)),
    ]);

    res.json({
      success: true,
      data: {
        partner,
        recentVisits: partner.visits.slice(0, 10),
        weeklyReport,
        scoreBreakdown,
        recommendations: scoreBreakdown.tips,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/v1/partners/:id/analytics - Get partner analytics
 */
export async function handleGetAnalytics(req: AuthRequest, res: Response) {
  try {
    const analytics = await getPartnerAnalytics(getParam(req.params.id));

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/v1/partners/:id/score - Get partner score breakdown
 */
export async function handleGetScore(req: AuthRequest, res: Response) {
  try {
    const score = await getScoreBreakdown(getParam(req.params.id));

    res.json({
      success: true,
      data: score,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================================
// Visit Endpoints
// ============================================================

/**
 * POST /api/v1/partners/visits - Record a visit check-in
 */
export async function handleVisitCheckin(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
    });
  }

  try {
    const result = await recordVisit({
      partnerId: req.body.partnerId,
      userId: req.body.userId,
      checkInId: req.body.checkInId,
      lat: String(req.body.lat),
      lng: String(req.body.lng),
      accuracy: req.body.accuracy,
    });

    if (!result.verified) {
      return res.status(400).json({
        success: false,
        verified: false,
        distance: result.distance,
        message: result.message,
      });
    }

    res.json({
      success: true,
      verified: true,
      distance: result.distance,
      message: result.message,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================================
// Billing Endpoints
// ============================================================

/**
 * GET /api/v1/partners/:id/billing/:month - Get monthly billing
 */
export async function handleGetBilling(req: AuthRequest, res: Response) {
  try {
    const billing = await getMonthlyBilling(getParam(req.params.id), String(req.params.month));

    res.json({
      success: true,
      data: billing,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/v1/partners/:id/billing/:month/confirm - Mark visits as billed
 */
export async function handleConfirmBilling(req: AuthRequest, res: Response) {
  try {
    await markVisitsAsBilled(getParam(req.params.id), String(req.params.month));

    res.json({
      success: true,
      message: 'Billing confirmed',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================================
// Featured Placement Endpoints
// ============================================================

/**
 * GET /api/v1/partners/featured/:restaurantId - Get featured placement score
 */
export async function handleGetFeaturedScore(req: AuthRequest, res: Response) {
  try {
    const score = await getFeaturedPlacementScore(getParam(req.params.restaurantId));

    res.json({
      success: true,
      data: score,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================================
// Promo Code Endpoints
// ============================================================

/**
 * POST /api/v1/partners/:id/promo-codes - Create promo code
 */
export async function handleCreatePromoCode(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
    });
  }

  try {
    const promoCode = await createPromoCode({
      partnerId: getParam(req.params.id),
      code: req.body.code,
      description: req.body.description,
      discountType: req.body.discountType,
      discountValue: req.body.discountValue,
      minOrderVND: req.body.minOrderVND,
      maxUses: req.body.maxUses,
      validFrom: new Date(req.body.validFrom),
      validUntil: new Date(req.body.validUntil),
    });

    res.status(201).json({
      success: true,
      data: promoCode,
      message: 'Promo code created successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/v1/partners/:id/promo-codes - List promo codes
 */
export async function handleListPromoCodes(req: AuthRequest, res: Response) {
  try {
    const promoCodes = await getPromoCodes(getParam(req.params.id));

    res.json({
      success: true,
      data: promoCodes.map((code) => ({
        ...code,
        remaining: code.maxUses - code.usedCount,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================================
// Corporate Account Endpoints
// ============================================================

/**
 * POST /api/v1/corporate/accounts - Create corporate account
 */
export async function handleCreateCorporateAccount(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
    });
  }

  try {
    const account = await createCorporateAccount({
      companyName: req.body.companyName,
      companyEmail: req.body.companyEmail,
      companyPhone: req.body.companyPhone,
      taxId: req.body.taxId,
      address: req.body.address,
      tier: req.body.tier,
      maxSeats: req.body.maxSeats,
    });

    res.status(201).json({
      success: true,
      data: account,
      message: 'Corporate account created successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/v1/corporate/accounts/:id/members - Add corporate member
 */
export async function handleAddCorporateMember(req: AuthRequest, res: Response) {
  try {
    const member = await addCorporateMember(
      getParam(req.params.id),
      req.body.userId,
      req.body.role || 'USER'
    );

    res.status(201).json({
      success: true,
      data: member,
      message: 'Member added successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}
