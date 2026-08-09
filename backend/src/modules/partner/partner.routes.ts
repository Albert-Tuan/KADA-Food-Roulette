/**
 * Partner Routes - B2B Restaurant Partner API Routes
 * Version: 1.2 | Date: 2026-08-09 | Fixed route types
 */

import { Router, RequestHandler } from 'express';
import { authenticateJWT } from '../../shared/middleware/auth.middleware';
import {
  partnerValidation,
  handleRegisterPartner,
  handleGetPartner,
  handleUpdatePartner,
  handleUpgradeTier,
  handleGetPartnerByRestaurant,
  handleGetDashboard,
  handleGetAnalytics,
  handleGetScore,
  handleVisitCheckin,
  handleGetBilling,
  handleConfirmBilling,
  handleGetFeaturedScore,
  handleCreatePromoCode,
  handleListPromoCodes,
  handleCreateCorporateAccount,
  handleAddCorporateMember,
} from './partner.controller';

const router = Router();

// Type cast for handlers
const handleGetPartnerByRestaurant_ = handleGetPartnerByRestaurant as RequestHandler;
const handleGetFeaturedScore_ = handleGetFeaturedScore as RequestHandler;
const handleRegisterPartner_ = handleRegisterPartner as RequestHandler;
const handleGetPartner_ = handleGetPartner as RequestHandler;
const handleUpdatePartner_ = handleUpdatePartner as RequestHandler;
const handleUpgradeTier_ = handleUpgradeTier as RequestHandler;
const handleGetDashboard_ = handleGetDashboard as RequestHandler;
const handleGetAnalytics_ = handleGetAnalytics as RequestHandler;
const handleGetScore_ = handleGetScore as RequestHandler;
const handleVisitCheckin_ = handleVisitCheckin as RequestHandler;
const handleGetBilling_ = handleGetBilling as RequestHandler;
const handleConfirmBilling_ = handleConfirmBilling as RequestHandler;
const handleCreatePromoCode_ = handleCreatePromoCode as RequestHandler;
const handleListPromoCodes_ = handleListPromoCodes as RequestHandler;
const handleCreateCorporateAccount_ = handleCreateCorporateAccount as RequestHandler;
const handleAddCorporateMember_ = handleAddCorporateMember as RequestHandler;

// ============================================================
// Partner Routes
// ============================================================

// Public routes
router.get('/restaurant/:restaurantId', handleGetPartnerByRestaurant_);
router.get('/featured/:restaurantId', handleGetFeaturedScore_);

// Partner registration (public for restaurant owners)
router.post('/', handleRegisterPartner_);

// Authenticated partner routes
router.use(authenticateJWT as any);

// Partner CRUD
router.get('/:id', handleGetPartner_);
router.put('/:id', partnerValidation.update, handleUpdatePartner_);
router.put('/:id/upgrade', partnerValidation.upgradeTier, handleUpgradeTier_);

// Dashboard & Analytics
router.get('/:id/dashboard', handleGetDashboard_);
router.get('/:id/analytics', handleGetAnalytics_);
router.get('/:id/score', handleGetScore_);

// Visit check-in
router.post('/visits', partnerValidation.visitCheckin, handleVisitCheckin_);

// Billing
router.get('/:id/billing/:month', handleGetBilling_);
router.post('/:id/billing/:month/confirm', handleConfirmBilling_);

// Promo Codes
router.post('/:id/promo-codes', partnerValidation.promoCode, handleCreatePromoCode_);
router.get('/:id/promo-codes', handleListPromoCodes_);

// ============================================================
// Corporate Routes
// ============================================================

// Public routes
router.post('/corporate/accounts', partnerValidation.corporateAccount, handleCreateCorporateAccount_);

// Authenticated corporate routes
router.post('/corporate/accounts/:id/members', handleAddCorporateMember_);

export default router;
