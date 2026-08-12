import { Router } from 'express';
import { moderationController } from './moderation.controller';
import { authenticateJWT } from '../../shared/middleware/auth.middleware';

const router = Router();

/**
 * All moderation routes require authentication + STEWARD/ADMIN role
 * (Role check is done inside each controller via requireSteward)
 */
router.use(authenticateJWT);

/**
 * GET /api/moderation/queue
 * List moderation queue items
 */
router.get('/queue', moderationController.getQueue);

/**
 * GET /api/moderation/queue/:id
 * Item detail
 */
router.get('/queue/:id', moderationController.getItem);

/**
 * POST /api/moderation/queue/:id/approve
 * Approve flagged content
 */
router.post('/queue/:id/approve', moderationController.approve);

/**
 * POST /api/moderation/queue/:id/reject
 * Reject flagged content
 */
router.post('/queue/:id/reject', moderationController.reject);

/**
 * POST /api/moderation/queue/:id/auto-hide
 * Auto-hide flagged content
 */
router.post('/queue/:id/auto-hide', moderationController.autoHide);

/**
 * GET /api/moderation/stats
 * Stats overview
 */
router.get('/stats', moderationController.getStats);

/**
 * POST /api/moderation/check
 * Manual check content (testing / explicit moderation)
 */
router.post('/check', moderationController.checkContent);

export default router;