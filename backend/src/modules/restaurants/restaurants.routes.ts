import { Router } from 'express';
import { restaurantsController } from './restaurants.controller';
import { authenticateJWT } from '../../shared/middleware/auth.middleware';
import { rateLimit } from '../../shared/middleware/rate-limit.middleware';

const router = Router();

/**
 * Rate limit cho geo endpoint (60 req/min/user)
 * Reference: ADR-002 Discover Map §4 Rate Limiting
 */
const nearbyRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? 'unknown',
  message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.',
});

/**
 * GET /api/restaurants/nearby
 * Discover Map: tìm quán ăn gần vị trí
 */
router.get('/nearby', nearbyRateLimit, restaurantsController.getNearby);

/**
 * GET /api/restaurants/:id
 * Chi tiết một quán ăn
 */
router.get('/:id', restaurantsController.getById);

/**
 * POST /api/restaurants
 * User-submitted restaurant (yêu cầu auth)
 */
router.post('/', authenticateJWT, restaurantsController.create);

export default router;