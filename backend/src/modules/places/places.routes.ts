import { Router } from 'express';
import { googlePlacesController } from './places.controller';
import { authenticateJWT } from '../../shared/middleware/auth.middleware';

const router = Router();

// Public: search nearby Google Places (no DB write)
router.get('/nearby', googlePlacesController.searchNearby);

// Auth: seed Google Places into our DB (cache for offline)
router.post('/seed', authenticateJWT, googlePlacesController.seed);

export default router;