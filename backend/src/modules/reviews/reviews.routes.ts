import { Router } from 'express';
import { reviewsController } from './reviews.controller';
import { authenticateJWT } from '../../shared/middleware/auth.middleware';

const router = Router();

// Public: list reviews by restaurant
router.get('/', reviewsController.listByRestaurant);

// Auth required
router.post('/', authenticateJWT, reviewsController.create);
router.delete('/:id', authenticateJWT, reviewsController.delete);
router.post('/:id/helpful', authenticateJWT, reviewsController.markHelpful);

export default router;